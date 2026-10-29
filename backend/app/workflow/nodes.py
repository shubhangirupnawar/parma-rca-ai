import logging
from typing import Dict, Any
from app.workflow.state import RCAWorkflowState
from app.services.groq_service import groq_service

logger = logging.getLogger("pharma_rca.workflow.nodes")

def receive_incident_input(state: RCAWorkflowState) -> Dict[str, Any]:
    """Node 1: Receive and sanitize raw incident input."""
    raw_text = state.get("raw_text", "").strip()
    source = state.get("input_source", "pasted_text")
    model_name = state.get("model_name", "llama-3.3-70b-versatile")
    
    logger.info(f"Workflow: Received incident input from source '{source}', length: {len(raw_text)} chars.")
    
    if not raw_text:
        return {
            "error_message": "Incident description text is empty. Please provide details or upload a document."
        }
        
    return {
        "raw_text": raw_text,
        "input_source": source,
        "model_name": model_name
    }

def extract_incident_information(state: RCAWorkflowState) -> Dict[str, Any]:
    """Node 2: Extract structured data from incident narrative."""
    raw_text = state.get("raw_text", "")
    model_name = state.get("model_name", "llama-3.3-70b-versatile")
    
    if state.get("error_message"):
        return {}

    logger.info("Workflow: Extracting structured pharmaceutical incident data...")
    try:
        extracted = groq_service.extract_incident_data(raw_text, model_override=model_name)
        return {
            "extracted_data": extracted,
            "is_demo_mode": extracted.get("is_demo_mode", False)
        }
    except Exception as e:
        logger.error(f"Extraction node failed: {e}")
        return {
            "error_message": f"Incident extraction failed: {str(e)}"
        }

def validate_extracted_information(state: RCAWorkflowState) -> Dict[str, Any]:
    """Node 3: Validate extracted fields, ensuring no empty hallucinations, marking 'Not provided'."""
    extracted = state.get("extracted_data", {})
    if state.get("error_message") or not extracted:
        return {}

    logger.info("Workflow: Validating extracted incident information against pharmaceutical standards...")
    
    validated = dict(extracted)
    keys_to_check = [
        "incident_title", "incident_description", "batch_number", 
        "product_name", "department", "incident_date", "observed_issue"
    ]
    
    for key in keys_to_check:
        val = validated.get(key)
        if not val or not str(val).strip() or str(val).strip().lower() in ["none", "null", "unknown", "n/a", ""]:
            validated[key] = "Not provided"
        else:
            validated[key] = str(val).strip()

    if not isinstance(validated.get("available_evidence"), list):
        validated["available_evidence"] = []
    if not isinstance(validated.get("missing_information"), list):
        validated["missing_information"] = []

    validation_status = {
        "is_valid": True,
        "fields_verified": len(keys_to_check),
        "has_batch": validated.get("batch_number") != "Not provided",
        "has_product": validated.get("product_name") != "Not provided",
        "has_date": validated.get("incident_date") != "Not provided",
    }

    return {
        "extracted_data": validated,
        "validation_status": validation_status
    }

def generate_potential_root_causes(state: RCAWorkflowState) -> Dict[str, Any]:
    """Node 4: Generate 5 Whys and 6M Fishbone root cause hypotheses."""
    extracted = state.get("extracted_data", {})
    model_name = state.get("model_name", "llama-3.3-70b-versatile")
    if state.get("error_message"):
        return {}

    logger.info("Workflow: Generating 5 Whys & 6M Fishbone root cause hypotheses...")
    try:
        rca_result = groq_service.generate_rca_and_capa(extracted, model_override=model_name)
        return {
            "five_whys": rca_result.get("five_whys", []),
            "root_causes": rca_result.get("root_causes", []),
            "evidence_items": rca_result.get("evidence_items", []),
            "capa_recommendations": rca_result.get("capa_recommendations", [])
        }
    except Exception as e:
        logger.error(f"Root cause generation failed: {e}")
        return {
            "error_message": f"Root cause analysis generation failed: {str(e)}"
        }

def identify_missing_evidence(state: RCAWorkflowState) -> Dict[str, Any]:
    """Node 5: Ensure missing evidence items and available evidence are clearly segregated."""
    evidence_items = state.get("evidence_items", [])
    extracted = state.get("extracted_data", {})
    
    # If LLM didn't produce evidence_items directly, convert from extracted
    if not evidence_items:
        items = []
        for ev in extracted.get("available_evidence", []):
            items.append({
                "item_type": "AVAILABLE",
                "title": ev,
                "description": "Evidence recorded in original incident report",
                "source_reference": "Original Incident Report",
                "is_collected": True
            })
        for mi in extracted.get("missing_information", []):
            items.append({
                "item_type": "MISSING",
                "title": mi,
                "description": "Required investigation artifact to confirm/refute root cause hypotheses",
                "source_reference": "To be collected by QA / Manufacturing",
                "is_collected": False
            })
        evidence_items = items

    return {"evidence_items": evidence_items}

def generate_capa_recommendations(state: RCAWorkflowState) -> Dict[str, Any]:
    """Node 6: Validates and enriches CAPA recommendations with human approval workflow attributes."""
    capas = state.get("capa_recommendations", [])
    enriched_capas = []
    
    for c in capas:
        item = dict(c)
        if "human_status" not in item:
            item["human_status"] = "PENDING_REVIEW"
        if "suggested_priority" not in item:
            item["suggested_priority"] = "HIGH"
        if "action_type" not in item:
            item["action_type"] = "CORRECTIVE"
        enriched_capas.append(item)

    return {"capa_recommendations": enriched_capas}

def format_human_review_package(state: RCAWorkflowState) -> Dict[str, Any]:
    """Node 7: Format final structured results for human QA review and sign-off."""
    logger.info("Workflow: Packaging RCA investigation for qualified human review.")
    
    package = {
        "incident_data": state.get("extracted_data", {}),
        "validation_status": state.get("validation_status", {}),
        "five_whys": state.get("five_whys", []),
        "root_causes": state.get("root_causes", []),
        "evidence_items": state.get("evidence_items", []),
        "capa_recommendations": state.get("capa_recommendations", []),
        "is_demo_mode": state.get("is_demo_mode", False),
        "requires_human_approval": True,
        "human_verification_notice": (
            "NOTICE: All AI-generated causes and recommendations are investigative hypotheses. "
            "Under GxP / 21 CFR Part 11 requirements, a qualified pharmaceutical quality professional "
            "must independently review, verify, and approve all findings before execution."
        )
    }

    return {"final_package": package}
