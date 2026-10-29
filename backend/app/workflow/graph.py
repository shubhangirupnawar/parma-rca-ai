import logging
from langgraph.graph import StateGraph, START, END

from app.workflow.state import RCAWorkflowState
from app.workflow.nodes import (
    receive_incident_input,
    extract_incident_information,
    validate_extracted_information,
    generate_potential_root_causes,
    identify_missing_evidence,
    generate_capa_recommendations,
    format_human_review_package,
)

logger = logging.getLogger("pharma_rca.workflow.graph")

def check_for_errors(state: RCAWorkflowState) -> str:
    """Conditional edge routing: stop if error occurs."""
    if state.get("error_message"):
        return "format_human_review_package"
    return "next"

def build_rca_graph() -> StateGraph:
    """
    Constructs the end-to-end LangGraph Root Cause Analysis workflow.
    """
    workflow = StateGraph(RCAWorkflowState)

    # Add Nodes
    workflow.add_node("receive_input", receive_incident_input)
    workflow.add_node("extract_info", extract_incident_information)
    workflow.add_node("validate_info", validate_extracted_information)
    workflow.add_node("generate_root_causes", generate_potential_root_causes)
    workflow.add_node("identify_evidence", identify_missing_evidence)
    workflow.add_node("generate_capa", generate_capa_recommendations)
    workflow.add_node("format_package", format_human_review_package)

    # Add Edges
    workflow.add_edge(START, "receive_input")
    workflow.add_edge("receive_input", "extract_info")
    workflow.add_edge("extract_info", "validate_info")
    workflow.add_edge("validate_info", "generate_root_causes")
    workflow.add_edge("generate_root_causes", "identify_evidence")
    workflow.add_edge("identify_evidence", "generate_capa")
    workflow.add_edge("generate_capa", "format_package")
    workflow.add_edge("format_package", END)

    return workflow.compile()

# Precompiled graph instance
rca_graph = build_rca_graph()

def run_rca_workflow(raw_text: str, input_source: str = "pasted_text", model_name: str = "llama-3.3-70b-versatile") -> dict:
    """
    Executes the full LangGraph RCA pipeline.
    """
    initial_state: RCAWorkflowState = {
        "raw_text": raw_text,
        "input_source": input_source,
        "model_name": model_name
    }
    
    logger.info("Executing LangGraph RCA workflow execution...")
    result_state = rca_graph.invoke(initial_state)
    logger.info("LangGraph workflow execution finished.")
    
    return result_state
