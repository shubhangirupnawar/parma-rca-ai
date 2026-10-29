from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ExtractRequest(BaseModel):
    raw_text: str = Field(..., description="Raw incident text, email body, or extracted document content")
    input_source: str = Field(default="pasted_text", description="'pdf', 'pasted_text', or 'email'")

class ExtractedDataResponse(BaseModel):
    incident_title: str = Field(default="Not provided")
    incident_description: str = Field(default="Not provided")
    batch_number: str = Field(default="Not provided")
    product_name: str = Field(default="Not provided")
    department: str = Field(default="Not provided")
    incident_date: str = Field(default="Not provided")
    observed_issue: str = Field(default="Not provided")
    available_evidence: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    is_demo_mode: bool = False
    ai_model_used: str = "llama-3.3-70b-versatile"

class EvidenceItemCreate(BaseModel):
    id: Optional[str] = None
    item_type: str = "AVAILABLE" # 'AVAILABLE' or 'MISSING'
    title: str
    description: Optional[str] = None
    source_reference: Optional[str] = None
    is_collected: bool = False

class EvidenceItemResponse(BaseModel):
    id: str
    investigation_id: str
    item_type: str
    title: str
    description: Optional[str] = None
    source_reference: Optional[str] = None
    is_collected: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FiveWhyStep(BaseModel):
    level: int
    question: str
    answer: str

class RootCauseCreate(BaseModel):
    id: Optional[str] = None
    category: str = "Method" # 'Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment'
    hypothesis_title: str
    description: str
    why_considered: str
    supporting_evidence: List[str] = Field(default_factory=list)
    contradictory_evidence: List[str] = Field(default_factory=list)
    further_investigation_steps: List[str] = Field(default_factory=list)
    confidence_level: str = "Moderate Hypothesis" # "High Confidence", "Moderate Hypothesis", "Low / Needs Verification"
    is_confirmed_by_human: bool = False
    human_feedback: Optional[str] = None

class RootCauseResponse(BaseModel):
    id: str
    investigation_id: str
    category: str
    hypothesis_title: str
    description: str
    why_considered: str
    supporting_evidence: List[Any] = Field(default_factory=list)
    contradictory_evidence: List[Any] = Field(default_factory=list)
    further_investigation_steps: List[Any] = Field(default_factory=list)
    confidence_level: str
    is_confirmed_by_human: bool = False
    human_feedback: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CapaRecommendationCreate(BaseModel):
    id: Optional[str] = None
    action_type: str = "CORRECTIVE" # 'CORRECTIVE', 'PREVENTIVE', 'EFFECTIVENESS_VERIFICATION'
    action_description: str
    reason_for_recommendation: str
    supporting_evidence: Optional[str] = None
    suggested_department: str = "Quality Assurance"
    suggested_priority: str = "HIGH" # 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    human_status: str = "PENDING_REVIEW"
    human_notes: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None

class CapaRecommendationResponse(BaseModel):
    id: str
    investigation_id: str
    action_type: str
    action_description: str
    reason_for_recommendation: str
    supporting_evidence: Optional[str] = None
    suggested_department: str
    suggested_priority: str
    human_status: str
    human_notes: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InvestigationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    raw_input_text: Optional[str] = None
    input_source: str = "pasted_text"
    batch_number: Optional[str] = "Not provided"
    product_name: Optional[str] = "Not provided"
    department: Optional[str] = "Not provided"
    incident_date: Optional[str] = "Not provided"
    observed_issue: Optional[str] = "Not provided"
    status: str = "DRAFT"
    ai_model_used: Optional[str] = "llama-3.3-70b-versatile"
    is_demo_mode: bool = False
    five_whys_data: Optional[List[Any]] = None
    evidence_items: List[EvidenceItemCreate] = Field(default_factory=list)
    root_causes: List[RootCauseCreate] = Field(default_factory=list)
    capa_recommendations: List[CapaRecommendationCreate] = Field(default_factory=list)

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    batch_number: Optional[str] = None
    product_name: Optional[str] = None
    department: Optional[str] = None
    incident_date: Optional[str] = None
    observed_issue: Optional[str] = None
    status: Optional[str] = None
    is_human_verified: Optional[bool] = None
    human_reviewer_name: Optional[str] = None
    human_review_notes: Optional[str] = None
    five_whys_data: Optional[List[Any]] = None
    evidence_items: Optional[List[EvidenceItemCreate]] = None
    root_causes: Optional[List[RootCauseCreate]] = None
    capa_recommendations: Optional[List[CapaRecommendationCreate]] = None

class InvestigationResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    raw_input_text: Optional[str] = None
    input_source: str
    batch_number: str
    product_name: str
    department: str
    incident_date: str
    observed_issue: str
    status: str
    ai_model_used: str
    is_demo_mode: bool
    is_human_verified: bool
    human_reviewer_name: Optional[str] = None
    human_review_notes: Optional[str] = None
    verification_timestamp: Optional[datetime] = None
    five_whys_data: Optional[List[Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    evidence_items: List[EvidenceItemResponse] = Field(default_factory=list)
    root_causes: List[RootCauseResponse] = Field(default_factory=list)
    capa_recommendations: List[CapaRecommendationResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

class InvestigationListItem(BaseModel):
    id: str
    title: str
    product_name: str
    batch_number: str
    department: str
    status: str
    incident_date: str
    is_human_verified: bool
    is_demo_mode: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CapaApprovalRequest(BaseModel):
    action: str = Field(..., description="'APPROVED', 'REJECTED', or 'MODIFIED'")
    reviewer_name: str = Field(..., min_length=2)
    notes: Optional[str] = None

class HumanVerificationRequest(BaseModel):
    reviewer_name: str = Field(..., min_length=2)
    review_notes: Optional[str] = None
    mark_as_verified: bool = True
