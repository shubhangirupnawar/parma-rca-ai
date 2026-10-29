import json
import logging
import re
from typing import Dict, Any, Optional
from groq import Groq

from app.config import settings
from app.services.demo_data import generate_demo_extraction, generate_demo_rca_and_capa

logger = logging.getLogger("pharma_rca.groq_service")

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self._client: Optional[Groq] = None
        self._init_client()

    def _init_client(self):
        if settings.is_groq_configured:
            try:
                self._client = Groq(api_key=self.api_key)
                logger.info(f"Groq API client initialized with model: {self.model}")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self._client = None
        else:
            logger.info("GROQ_API_KEY is not configured. PharmaRCA will run in Pharmaceutical Simulation / Demo Mode.")
            self._client = None

    def clean_json_response(self, text: str) -> dict:
        """Extracts and parses JSON object from model output safely."""
        text = text.strip()
        # Look for markdown code fence
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if json_match:
            text = json_match.group(1).strip()
        
        # If text still contains non-JSON prefix/suffix, find outermost braces
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            text = text[start:end+1]
            
        try:
            return json.loads(text)
        except Exception as e:
            logger.error(f"Failed to parse JSON response: {e}. Raw snippet: {text[:200]}")
            raise ValueError(f"Could not parse valid JSON from AI response: {str(e)}")

    def extract_incident_data(self, raw_text: str, model_override: Optional[str] = None) -> Dict[str, Any]:
        """
        Extracts structured incident data from raw text/document using Groq LLM.
        Preserves source information and flags unavailable items as 'Not provided'.
        """
        active_model = model_override or self.model
        
        if not self._client or not settings.is_groq_configured:
            logger.info("Executing incident extraction in Demo Mode.")
            return generate_demo_extraction(raw_text, active_model)

        system_prompt = """You are a senior pharmaceutical quality assurance (QA/QC) specialist and GxP compliance officer.
Your task is to extract structured information from the provided manufacturing incident report, deviation notice, or email.

CRITICAL INSTRUCTIONS:
1. Preserve source fidelity strictly. DO NOT invent, hallucinate, or extrapolate facts not present in the input.
2. If any piece of information is missing or not explicitly stated, you MUST set its value to "Not provided".
3. Return a valid JSON object matching the EXACT schema below.

JSON Schema:
{
  "incident_title": "Concise summary title of the quality incident",
  "incident_description": "Clear chronological description of what occurred",
  "batch_number": "Batch or lot identifier (or 'Not provided')",
  "product_name": "API or pharmaceutical product name (or 'Not provided')",
  "department": "Manufacturing unit, suite, or department (or 'Not provided')",
  "incident_date": "Date when incident occurred (or 'Not provided')",
  "observed_issue": "Specific quality defect, OOS result, or parameter deviation (or 'Not provided')",
  "available_evidence": [
    "List of evidence items, documents, or data mentioned as available in the source"
  ],
  "missing_information": [
    "List of specific data gaps, missing logs, or unconfirmed parameters needed for investigation"
  ]
}"""

        user_prompt = f"Extract structured pharmaceutical incident data from this text:\n\n{raw_text}"

        try:
            response = self._client.chat.completions.create(
                model=active_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"} if "llama" in active_model else None,
                max_tokens=2048,
            )
            content = response.choices[0].message.content
            parsed = self.clean_json_response(content)
            parsed["is_demo_mode"] = False
            parsed["ai_model_used"] = active_model
            return parsed
        except Exception as e:
            logger.warning(f"Groq API call failed ({str(e)}). Falling back to compliant simulation.")
            demo = generate_demo_extraction(raw_text, active_model)
            demo["is_demo_mode"] = True
            demo["ai_model_used"] = f"{active_model} (Fallback: {str(e)[:40]}...)"
            return demo

    def generate_rca_and_capa(self, incident_data: Dict[str, Any], model_override: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates 5 Whys analysis, 6M Fishbone hypotheses, missing evidence gaps,
        and human-in-the-loop CAPA recommendations.
        """
        active_model = model_override or self.model

        if not self._client or not settings.is_groq_configured:
            logger.info("Executing RCA and CAPA generation in Demo Mode.")
            return generate_demo_rca_and_capa(incident_data)

        system_prompt = """You are a Master Principal Quality Engineer in Active Pharmaceutical Ingredient (API) Manufacturing.
Conduct an in-depth Root Cause Analysis (RCA) and generate Corrective and Preventive Actions (CAPA) according to ICH Q9 (Quality Risk Management) and ICH Q10 (Pharmaceutical Quality System).

CRITICAL COMPLIANCE RULES:
1. Treat all AI-generated causes as HYPOTHESES until confirmed by a qualified human professional with objective evidence.
2. Fishbone analysis must cover the 6M categories:
   - Man: operator training, shift handovers, human factors, adherence to SOP
   - Machine: equipment breakdown, calibration status, seals, utility cooling/heating, PLC/SCADA
   - Method: batch manufacturing recipe, mixing times, cooling curves, sampling technique
   - Material: raw material assay, solvent recycling, reagent lot variability, supplier CoA
   - Measurement: HPLC baseline drift, RTD sensor accuracy, pH probe calibration, LOD method
   - Environment: cleanroom humidity, differential pressure, cleanroom particulate, ambient weather
3. Five Whys: Provide 5 progressive levels drilling from symptom down to root systemic failure.
4. Missing Evidence: Clearly list specific GxP records that MUST be gathered (e.g. SCADA historian, calibration certificates, BMR pages, operator training logs).
5. CAPA: Recommend Corrective Actions (immediate containment), Preventive Actions (systemic process/equipment/SOP fix), and Effectiveness Verification (sampling protocol and timeframe).
6. Return ONLY valid JSON matching the schema below.

JSON Schema:
{
  "five_whys": [
    {
      "level": 1,
      "question": "Why did the observed quality defect occur?",
      "answer": "..."
    },
    {
      "level": 2,
      "question": "Why ...?",
      "answer": "..."
    },
    {
      "level": 3,
      "question": "Why ...?",
      "answer": "..."
    },
    {
      "level": 4,
      "question": "Why ...?",
      "answer": "..."
    },
    {
      "level": 5,
      "question": "Why ...? (Root Cause)",
      "answer": "..."
    }
  ],
  "root_causes": [
    {
      "category": "Machine", 
      "hypothesis_title": "Concise hypothesis title",
      "description": "Detailed explanation of potential failure mode",
      "why_considered": "Rationale based on incident facts",
      "supporting_evidence": ["Evidence point 1"],
      "contradictory_evidence": ["Contradictory or unconfirmed point 1"],
      "further_investigation_steps": ["Step 1 to test or verify this hypothesis"],
      "confidence_level": "High Confidence" // Options: "High Confidence", "Moderate Hypothesis", "Low / Needs Verification"
    }
  ],
  "evidence_items": [
    {
      "item_type": "AVAILABLE",
      "title": "Document or evidence name",
      "description": "Details of the available record",
      "source_reference": "Department or system",
      "is_collected": true
    },
    {
      "item_type": "MISSING",
      "title": "Critical missing log or certificate",
      "description": "Why this record is essential for verifying root causes",
      "source_reference": "Metrology / Maintenance / QC / Production",
      "is_collected": false
    }
  ],
  "capa_recommendations": [
    {
      "action_type": "CORRECTIVE", // Options: "CORRECTIVE", "PREVENTIVE", "EFFECTIVENESS_VERIFICATION"
      "action_description": "Specific, actionable containment or remediation task",
      "reason_for_recommendation": "Why this action is required",
      "supporting_evidence": "Finding or evidence supporting this action",
      "suggested_department": "Quality Assurance / Production / Maintenance",
      "suggested_priority": "CRITICAL" // Options: "CRITICAL", "HIGH", "MEDIUM", "LOW"
    }
  ]
}"""

        user_content = f"""Perform Root Cause Analysis and generate CAPA recommendations for this pharmaceutical quality incident:
Title: {incident_data.get('incident_title', 'Not provided')}
Product: {incident_data.get('product_name', 'Not provided')}
Batch: {incident_data.get('batch_number', 'Not provided')}
Department: {incident_data.get('department', 'Not provided')}
Date: {incident_data.get('incident_date', 'Not provided')}
Observed Issue: {incident_data.get('observed_issue', 'Not provided')}
Description: {incident_data.get('incident_description', 'Not provided')}
Available Evidence: {json.dumps(incident_data.get('available_evidence', []))}
Missing Information: {json.dumps(incident_data.get('missing_information', []))}
"""

        try:
            response = self._client.chat.completions.create(
                model=active_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.2,
                response_format={"type": "json_object"} if "llama" in active_model else None,
                max_tokens=4096,
            )
            content = response.choices[0].message.content
            parsed = self.clean_json_response(content)
            return parsed
        except Exception as e:
            logger.warning(f"Groq API RCA call failed ({str(e)}). Falling back to demo data.")
            return generate_demo_rca_and_capa(incident_data)

groq_service = GroqService()
