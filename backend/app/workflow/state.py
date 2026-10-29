from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict

class RCAWorkflowState(TypedDict, total=False):
    # Stage 1: Input
    raw_text: str
    input_source: str
    model_name: str
    
    # Stage 2: Extraction
    extracted_data: Dict[str, Any]
    
    # Stage 3: Validation
    validation_status: Dict[str, Any]
    
    # Stage 4: Root Cause Hypotheses (5 Whys + 6M Fishbone)
    five_whys: List[Dict[str, Any]]
    root_causes: List[Dict[str, Any]]
    
    # Stage 5: Missing Evidence Identification
    evidence_items: List[Dict[str, Any]]
    
    # Stage 6: CAPA Recommendations
    capa_recommendations: List[Dict[str, Any]]
    
    # Stage 7: Human Review Package
    final_package: Dict[str, Any]
    
    # Metadata & Error Handling
    error_message: Optional[str]
    is_demo_mode: bool
