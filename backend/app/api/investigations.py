import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.config import settings
from app.models.investigation import Investigation, EvidenceItem, RootCause, CapaRecommendation
from app.schemas.investigation import (
    ExtractRequest,
    ExtractedDataResponse,
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationResponse,
    InvestigationListItem,
    CapaApprovalRequest,
    HumanVerificationRequest,
)
from app.services.pdf_service import extract_text_from_pdf
from app.services.groq_service import groq_service
from app.services.demo_data import SAMPLE_INCIDENT_TEXTS
from app.workflow.graph import run_rca_workflow

logger = logging.getLogger("pharma_rca.api.investigations")
router = APIRouter(prefix="/api/investigations", tags=["Investigations"])

@router.get("/samples", summary="List available pharma incident samples for quick testing")
def get_sample_incidents():
    return {
        "samples": [
            {
                "key": "crystallization_oos",
                "title": "Paracetamol API - Impurity B Out-of-Specification (Crystallization Excursion)",
                "batch": "PARA-2026-089A",
                "department": "API Synthesis & Purification Unit 3",
                "text": SAMPLE_INCIDENT_TEXTS["crystallization_oos"]
            },
            {
                "key": "residual_solvent",
                "title": "Atorvastatin Calcium Trihydrate API - Residual Methanol Excursion",
                "batch": "ATV-2026-114",
                "department": "Finished API Processing & Drying",
                "text": SAMPLE_INCIDENT_TEXTS["residual_solvent"]
            }
        ]
    }

@router.post("/extract", response_model=ExtractedDataResponse, summary="Extract incident information using Groq AI")
def extract_incident_info(payload: ExtractRequest):
    if not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Raw text content cannot be empty.")
    
    try:
        extracted = groq_service.extract_incident_data(payload.raw_text)
        return extracted
    except Exception as e:
        logger.error(f"Error in /extract: {e}")
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")

@router.post("/upload-pdf", summary="Upload and extract text from pharmaceutical incident PDF")
async def upload_pdf_document(file: UploadFile = File(...)):
    # File validation
    filename = file.filename or "unknown.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are accepted.")

    # Read bytes and check size
    file_bytes = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=400, 
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    text, ocr_required, message = extract_text_from_pdf(file_bytes)
    
    return {
        "filename": filename,
        "file_size_bytes": len(file_bytes),
        "extracted_text": text,
        "ocr_required": ocr_required,
        "message": message,
        "char_count": len(text)
    }

@router.post("/run-workflow", summary="Run full LangGraph RCA & CAPA Workflow")
def run_full_rca_workflow(payload: ExtractRequest):
    """
    Executes the entire LangGraph pipeline:
    START -> receive -> extract -> validate -> root causes -> missing evidence -> CAPA -> format -> END
    """
    if not payload.raw_text.strip():
        raise HTTPException(status_code=400, detail="Incident text cannot be empty.")

    try:
        workflow_result = run_rca_workflow(
            raw_text=payload.raw_text,
            input_source=payload.input_source,
            model_name=settings.GROQ_MODEL
        )

        if workflow_result.get("error_message"):
            raise HTTPException(status_code=400, detail=workflow_result["error_message"])

        return workflow_result.get("final_package", {})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing LangGraph RCA workflow: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@router.get("", response_model=List[InvestigationListItem], summary="List all investigations")
def list_investigations(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Investigation)
    
    if status_filter:
        query = query.filter(Investigation.status == status_filter)
        
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Investigation.title.ilike(search_pattern)) |
            (Investigation.batch_number.ilike(search_pattern)) |
            (Investigation.product_name.ilike(search_pattern)) |
            (Investigation.department.ilike(search_pattern))
        )
        
    return query.order_by(desc(Investigation.created_at)).limit(limit).all()

@router.post("", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED, summary="Create and save investigation")
def create_investigation(payload: InvestigationCreate, db: Session = Depends(get_db)):
    try:
        new_inv = Investigation(
            title=payload.title,
            description=payload.description,
            raw_input_text=payload.raw_input_text,
            input_source=payload.input_source,
            batch_number=payload.batch_number or "Not provided",
            product_name=payload.product_name or "Not provided",
            department=payload.department or "Not provided",
            incident_date=payload.incident_date or "Not provided",
            observed_issue=payload.observed_issue or "Not provided",
            status=payload.status or "DRAFT",
            ai_model_used=payload.ai_model_used or settings.GROQ_MODEL,
            is_demo_mode=payload.is_demo_mode,
            five_whys_data=payload.five_whys_data,
        )
        db.add(new_inv)
        db.flush() # populate new_inv.id

        # Add Evidence items
        for ev in payload.evidence_items:
            db.add(EvidenceItem(
                investigation_id=new_inv.id,
                item_type=ev.item_type,
                title=ev.title,
                description=ev.description,
                source_reference=ev.source_reference,
                is_collected=ev.is_collected
            ))

        # Add Root Causes
        for rc in payload.root_causes:
            db.add(RootCause(
                investigation_id=new_inv.id,
                category=rc.category,
                hypothesis_title=rc.hypothesis_title,
                description=rc.description,
                why_considered=rc.why_considered,
                supporting_evidence=rc.supporting_evidence,
                contradictory_evidence=rc.contradictory_evidence,
                further_investigation_steps=rc.further_investigation_steps,
                confidence_level=rc.confidence_level,
                is_confirmed_by_human=rc.is_confirmed_by_human,
                human_feedback=rc.human_feedback
            ))

        # Add CAPA Recommendations
        for capa in payload.capa_recommendations:
            db.add(CapaRecommendation(
                investigation_id=new_inv.id,
                action_type=capa.action_type,
                action_description=capa.action_description,
                reason_for_recommendation=capa.reason_for_recommendation,
                supporting_evidence=capa.supporting_evidence,
                suggested_department=capa.suggested_department,
                suggested_priority=capa.suggested_priority,
                human_status=capa.human_status or "PENDING_REVIEW",
                human_notes=capa.human_notes,
                approved_by=capa.approved_by,
                approved_at=capa.approved_at
            ))

        db.commit()
        db.refresh(new_inv)
        return new_inv
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating investigation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create investigation: {str(e)}")

@router.get("/{investigation_id}", response_model=InvestigationResponse, summary="Get investigation by ID")
def get_investigation(investigation_id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")
    return inv

@router.put("/{investigation_id}", response_model=InvestigationResponse, summary="Update reviewed investigation")
def update_investigation(investigation_id: str, payload: InvestigationUpdate, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    try:
        update_data = payload.dict(exclude_unset=True)
        
        # Scalar fields
        scalar_fields = [
            "title", "description", "batch_number", "product_name", 
            "department", "incident_date", "observed_issue", "status",
            "is_human_verified", "human_reviewer_name", "human_review_notes",
            "five_whys_data"
        ]
        for field in scalar_fields:
            if field in update_data:
                setattr(inv, field, update_data[field])

        # If marking as verified, timestamp it
        if update_data.get("is_human_verified") and not inv.verification_timestamp:
            inv.verification_timestamp = datetime.utcnow()

        # Update Evidence Items if provided
        if payload.evidence_items is not None:
            db.query(EvidenceItem).filter(EvidenceItem.investigation_id == inv.id).delete()
            for ev in payload.evidence_items:
                db.add(EvidenceItem(
                    investigation_id=inv.id,
                    item_type=ev.item_type,
                    title=ev.title,
                    description=ev.description,
                    source_reference=ev.source_reference,
                    is_collected=ev.is_collected
                ))

        # Update Root Causes if provided
        if payload.root_causes is not None:
            db.query(RootCause).filter(RootCause.investigation_id == inv.id).delete()
            for rc in payload.root_causes:
                db.add(RootCause(
                    investigation_id=inv.id,
                    category=rc.category,
                    hypothesis_title=rc.hypothesis_title,
                    description=rc.description,
                    why_considered=rc.why_considered,
                    supporting_evidence=rc.supporting_evidence,
                    contradictory_evidence=rc.contradictory_evidence,
                    further_investigation_steps=rc.further_investigation_steps,
                    confidence_level=rc.confidence_level,
                    is_confirmed_by_human=rc.is_confirmed_by_human,
                    human_feedback=rc.human_feedback
                ))

        # Update CAPAs if provided
        if payload.capa_recommendations is not None:
            db.query(CapaRecommendation).filter(CapaRecommendation.investigation_id == inv.id).delete()
            for capa in payload.capa_recommendations:
                db.add(CapaRecommendation(
                    investigation_id=inv.id,
                    action_type=capa.action_type,
                    action_description=capa.action_description,
                    reason_for_recommendation=capa.reason_for_recommendation,
                    supporting_evidence=capa.supporting_evidence,
                    suggested_department=capa.suggested_department,
                    suggested_priority=capa.suggested_priority,
                    human_status=capa.human_status,
                    human_notes=capa.human_notes,
                    approved_by=capa.approved_by,
                    approved_at=capa.approved_at
                ))

        inv.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(inv)
        return inv
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating investigation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update investigation: {str(e)}")

@router.post("/{investigation_id}/verify", response_model=InvestigationResponse, summary="Human QA verification sign-off")
def verify_investigation(investigation_id: str, payload: HumanVerificationRequest, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    inv.is_human_verified = payload.mark_as_verified
    inv.human_reviewer_name = payload.reviewer_name
    inv.human_review_notes = payload.review_notes
    inv.verification_timestamp = datetime.utcnow()
    inv.status = "APPROVED" if payload.mark_as_verified else "PENDING_HUMAN_REVIEW"
    
    db.commit()
    db.refresh(inv)
    return inv

@router.post("/{investigation_id}/capa/{capa_id}/approve", summary="Human review and approval for single CAPA item")
def review_capa_action(
    investigation_id: str, 
    capa_id: str, 
    payload: CapaApprovalRequest, 
    db: Session = Depends(get_db)
):
    capa = db.query(CapaRecommendation).filter(
        CapaRecommendation.id == capa_id,
        CapaRecommendation.investigation_id == investigation_id
    ).first()
    
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA recommendation not found.")

    if payload.action not in ["APPROVED", "REJECTED", "MODIFIED"]:
        raise HTTPException(status_code=400, detail="Action must be 'APPROVED', 'REJECTED', or 'MODIFIED'.")

    capa.human_status = payload.action
    capa.approved_by = payload.reviewer_name
    capa.approved_at = datetime.utcnow()
    if payload.notes:
        capa.human_notes = payload.notes

    db.commit()
    return {
        "success": True,
        "capa_id": capa_id,
        "human_status": capa.human_status,
        "approved_by": capa.approved_by,
        "approved_at": capa.approved_at
    }

@router.delete("/{investigation_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete investigation")
def delete_investigation(investigation_id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    db.delete(inv)
    db.commit()
    return None
