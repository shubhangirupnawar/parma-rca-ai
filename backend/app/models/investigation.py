import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, default="Untitled Investigation")
    description = Column(Text, nullable=True)
    raw_input_text = Column(Text, nullable=True)
    input_source = Column(String(50), default="pasted_text") # 'pdf', 'pasted_text', 'email'
    
    # Pharmaceutical API Specific Attributes
    batch_number = Column(String(100), default="Not provided")
    product_name = Column(String(150), default="Not provided")
    department = Column(String(100), default="Not provided")
    incident_date = Column(String(50), default="Not provided")
    observed_issue = Column(Text, default="Not provided")
    
    # Status Lifecycle: DRAFT -> EXTRACTED -> RCA_GENERATED -> PENDING_HUMAN_REVIEW -> CAPA_APPROVED -> CLOSED
    status = Column(String(50), default="DRAFT", index=True)
    
    # AI Metadata & Quality Governance
    ai_model_used = Column(String(100), default="llama-3.3-70b-versatile")
    is_demo_mode = Column(Boolean, default=False)
    
    # Human Review & Qualified Professional Sign-off
    is_human_verified = Column(Boolean, default=False)
    human_reviewer_name = Column(String(100), nullable=True)
    human_review_notes = Column(Text, nullable=True)
    verification_timestamp = Column(DateTime, nullable=True)
    
    # 5 Whys Structured Summary
    five_whys_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    evidence_items = relationship("EvidenceItem", back_populates="investigation", cascade="all, delete-orphan")
    root_causes = relationship("RootCause", back_populates="investigation", cascade="all, delete-orphan")
    capa_recommendations = relationship("CapaRecommendation", back_populates="investigation", cascade="all, delete-orphan")

class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # 'AVAILABLE' (Provided) vs 'MISSING' (Evidence required for investigation)
    item_type = Column(String(20), nullable=False, default="AVAILABLE") 
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source_reference = Column(String(255), nullable=True) # e.g. "Operator Statement", "SCADA Historian", "BMR Page 14"
    is_collected = Column(Boolean, default=False) # For missing evidence, has it been acquired?
    
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="evidence_items")

class RootCause(Base):
    __tablename__ = "root_causes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Fishbone 6M Categories: 'Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment', or '5_Whys'
    category = Column(String(50), nullable=False, default="Method")
    hypothesis_title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    why_considered = Column(Text, nullable=False)
    
    supporting_evidence = Column(JSON, default=list) # List of strings
    contradictory_evidence = Column(JSON, default=list) # List of strings
    further_investigation_steps = Column(JSON, default=list) # List of strings
    
    # Status & Confidence
    confidence_level = Column(String(50), default="Moderate Hypothesis") # "High Confidence", "Moderate Hypothesis", "Low / Needs Verification"
    is_confirmed_by_human = Column(Boolean, default=False)
    human_feedback = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="root_causes")

class CapaRecommendation(Base):
    __tablename__ = "capa_recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # 'CORRECTIVE', 'PREVENTIVE', 'EFFECTIVENESS_VERIFICATION'
    action_type = Column(String(50), nullable=False, default="CORRECTIVE")
    action_description = Column(Text, nullable=False)
    reason_for_recommendation = Column(Text, nullable=False)
    supporting_evidence = Column(Text, nullable=True)
    suggested_department = Column(String(100), default="Quality Assurance")
    suggested_priority = Column(String(20), default="HIGH") # 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    
    # Governance & Approval Workflow
    human_status = Column(String(50), default="PENDING_REVIEW") # 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'MODIFIED'
    human_notes = Column(Text, nullable=True)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="capa_recommendations")
