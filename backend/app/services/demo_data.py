"""
High-fidelity pharmaceutical API manufacturing incident simulations for offline/demo mode.
Ensures zero-setup testing while maintaining realistic GxP terminology.
"""

SAMPLE_INCIDENT_TEXTS = {
    "crystallization_oos": """
QUALITY DEVIATION REPORT (INCIDENT-2026-DEV-088)
Date: 2026-03-14
Department: API Synthesis & Purification Unit 3
Reporter: Senior Production Chemist Marcus Vance
Product: Paracetamol (Acetaminophen) API Micronized Grade
Batch Number: PARA-2026-089A
Equipment Involved: Crystallizer CR-304 & Centrifuge CF-102

INCIDENT DESCRIPTION:
During final QC release testing of Batch PARA-2026-089A, the analytical laboratory reported an Out-of-Specification (OOS) result for Related Substance Impurity B (4-Aminophenol). The observed value was 0.18% w/w against the USP/Ph. Eur. specification limit of NMT 0.05% w/w. All other physical parameters (melting range, loss on drying, heavy metals) were within acceptance criteria.

PRELIMINARY INVESTIGATION & OBSERVATIONS:
1. Review of the Batch Manufacturing Record (BMR Page 42) indicates that during the reaction acetylation stage, reactor cooling jacket chilled water flow was interrupted for approximately 28 minutes at 14:15 due to secondary utility pump fault.
2. The reaction mass temperature spiked to 118°C (standard operating range is 102°C - 106°C).
3. The shift operator resumed cooling manually after switching to backup pump P-102B.
4. Acetic anhydride raw material lot used was AA-2026-0129, supplier Certificate of Analysis showed assay of 99.4%.
5. The recrystallization solvent mother liquor was recycled from previous recovery tank TK-901 without second HPLC verification assay.
6. The shift handover log did not record the 28-minute thermal excursion.

AVAILABLE EVIDENCE:
- QC HPLC Chromatogram & Analytical Test Report #AR-2026-4401 confirming 0.18% Impurity B.
- SCADA Temperature Historian trend for Reactor CR-304 showing temperature rise to 118°C.
- Raw material CoA for Acetic Anhydride Lot AA-2026-0129.
- Maintenance work order #WO-8821 for cooling pump P-102A repair.

MISSING EVIDENCE / DATA GAPS:
- HPLC analytical assay of recycled mother liquor in recovery tank TK-901 prior to batch charging.
- Operator shift handover logbook sign-off for Shift B on 2026-03-14.
- Temperature sensor calibration certificate for CR-304 RTD-03 (last calibrated 11 months ago).
- Cleaning verification swab test report for Crystallizer CR-304 prior to batch start.
""",
    "residual_solvent": """
ENVIRONMENTAL & QUALITY INCIDENT REPORT (DEV-2026-114)
Date: 2026-04-02
Department: Finished API Processing & Drying
Product: Atorvastatin Calcium Trihydrate API
Batch Number: ATV-2026-114
Equipment: Vacuum Tray Dryer VTD-04

DESCRIPTION:
Headspace Gas Chromatography (GC) analysis of composite release sample for Batch ATV-2026-114 revealed residual Methanol level of 3,850 ppm, significantly exceeding the ICH Q3C Class 2 solvent limit of NMT 3,000 ppm. 

BACKGROUND & DETAILS:
The drying cycle was operated for standard 18 hours at 45°C under vacuum of -0.092 MPa. However, recorded condenser coolant inlet temperature was +14°C rather than standard +4°C due to chiller loop scale accumulation. Furthermore, nitrogen bleed valve NV-02 was found partially throttled, reducing vacuum sweep efficiency. Raw material solvent Methanol USP lot ME-2026-09 had verified purity of 99.9%.

AVAILABLE EVIDENCE:
- GC Chromatogram with internal standard for residual solvents.
- VTD-04 digital vacuum recorder chart.
- Solvent certificate of analysis.

MISSING EVIDENCE:
- Chiller condenser heat exchanger differential pressure and descaling service record.
- In-process moisture and solvent loss on drying (LOD) check at 12 hours.
- Nitrogen purging flow meter calibration log.
"""
}

def generate_demo_extraction(raw_text: str, model_name: str) -> dict:
    text_lower = raw_text.lower()
    
    if "para" in text_lower or "acetaminophen" in text_lower or "impurity" in text_lower:
        return {
            "incident_title": "Out-of-Specification (OOS) Impurity B (4-Aminophenol) in Paracetamol API",
            "incident_description": "During final QC release testing, Related Substance Impurity B was detected at 0.18% w/w against specification NMT 0.05% w/w following an unrecorded 28-minute thermal excursion up to 118°C in Crystallizer CR-304.",
            "batch_number": "PARA-2026-089A",
            "product_name": "Paracetamol (Acetaminophen) API Micronized Grade",
            "department": "API Synthesis & Purification Unit 3",
            "incident_date": "2026-03-14",
            "observed_issue": "Out-of-Specification (OOS) Impurity B (4-Aminophenol) at 0.18% w/w (Specification: NMT 0.05% w/w)",
            "available_evidence": [
                "QC HPLC Chromatogram & Analytical Test Report #AR-2026-4401 showing 0.18% Impurity B",
                "SCADA Temperature Historian trend for Reactor CR-304 showing temperature rise to 118°C",
                "Raw material Certificate of Analysis for Acetic Anhydride Lot AA-2026-0129 (Assay 99.4%)",
                "Maintenance Work Order #WO-8821 for secondary cooling pump P-102A failure"
            ],
            "missing_information": [
                "Analytical assay of recycled mother liquor in recovery tank TK-901 prior to batch charging",
                "Operator shift handover logbook sign-off for Shift B on 2026-03-14",
                "Temperature sensor calibration certificate for CR-304 RTD-03 (last calibrated 11 months ago)",
                "Cleaning validation swab report for Crystallizer CR-304 prior to batch charging"
            ],
            "is_demo_mode": True,
            "ai_model_used": f"{model_name} (Pharma Demo Mode)"
        }
    elif "atorvastatin" in text_lower or "solvent" in text_lower or "dryer" in text_lower:
        return {
            "incident_title": "Residual Methanol Excursion (OOS) in Atorvastatin Calcium Trihydrate API",
            "incident_description": "Headspace GC release testing revealed residual Methanol level of 3,850 ppm exceeding ICH Q3C limit of NMT 3,000 ppm following reduced vacuum sweep and chiller condenser efficiency.",
            "batch_number": "ATV-2026-114",
            "product_name": "Atorvastatin Calcium Trihydrate API",
            "department": "Finished API Processing & Drying",
            "incident_date": "2026-04-02",
            "observed_issue": "Residual Methanol solvent level at 3,850 ppm exceeding ICH Q3C specification of NMT 3,000 ppm",
            "available_evidence": [
                "GC Chromatogram with internal standard showing 3,850 ppm Methanol",
                "VTD-04 digital vacuum recorder chart showing -0.092 MPa profile",
                "Solvent Certificate of Analysis for Methanol Lot ME-2026-09"
            ],
            "missing_information": [
                "Chiller condenser heat exchanger differential pressure and descaling service record",
                "In-process intermediate Loss on Drying (LOD) check at hour 12",
                "Nitrogen purging flow meter calibration log and leak test data"
            ],
            "is_demo_mode": True,
            "ai_model_used": f"{model_name} (Pharma Demo Mode)"
        }
    else:
        # Generic pharmaceutical API incident extraction
        return {
            "incident_title": "Active Pharmaceutical Ingredient (API) Quality Deviation Investigation",
            "incident_description": raw_text[:300] if len(raw_text) > 300 else raw_text,
            "batch_number": "Not provided",
            "product_name": "Not provided",
            "department": "API Manufacturing Quality Assurance",
            "incident_date": "Not provided",
            "observed_issue": "Reported deviation in pharmaceutical manufacturing / quality parameters",
            "available_evidence": [
                "Incident narrative provided in deviation notification",
                "Initial quality alert notification"
            ],
            "missing_information": [
                "Complete Batch Manufacturing Record (BMR) execution pages",
                "Analytical testing certificates & HPLC raw integration data",
                "Equipment calibration and preventive maintenance status logs",
                "Environmental monitoring and temperature excursion records"
            ],
            "is_demo_mode": True,
            "ai_model_used": f"{model_name} (Pharma Demo Mode)"
        }

def generate_demo_rca_and_capa(data: dict) -> dict:
    five_whys = [
        {
            "level": 1,
            "question": "Why did Batch PARA-2026-089A fail the QC release specification for Impurity B (4-Aminophenol)?",
            "answer": "Analytical HPLC testing detected 0.18% w/w free 4-aminophenol compared to the maximum specification limit of 0.05% w/w."
        },
        {
            "level": 2,
            "question": "Why was unreacted or degraded 4-aminophenol present in the final product?",
            "answer": "Incomplete acetylation and thermal degradation occurred during the reaction stage in Crystallizer CR-304."
        },
        {
            "level": 3,
            "question": "Why did reaction thermal degradation occur?",
            "answer": "The reaction temperature spiked to 118°C for 28 minutes, well beyond the validated control window of 102°C - 106°C."
        },
        {
            "level": 4,
            "question": "Why did the temperature spike and remain unmanaged for 28 minutes?",
            "answer": "Secondary utility chilled water pump P-102A tripped on thermal overload, and there was no automated failover or high-temperature audio alarm to alert operators."
        },
        {
            "level": 5,
            "question": "Why was there no automated failover or audible high-temperature alarm configured?",
            "answer": "Root Cause: The engineering interlock and alarm configuration on CR-304 had not been updated during the recent utility expansion, and the shift handover procedure lacked a mandatory deviation logbook check."
        }
    ]

    root_causes = [
        {
            "category": "Machine",
            "hypothesis_title": "Cooling Utility Pump P-102A Mechanical Failure & Lack of Auto-Switchover",
            "description": "Secondary cooling pump P-102A suffered a bearing seizure / thermal trip without automated PLC interlock switchover to standby pump P-102B, resulting in 28 minutes of uncooled reaction mass.",
            "why_considered": "SCADA historian shows exact correlation between pump electrical fault and immediate temperature spike to 118°C.",
            "supporting_evidence": [
                "Work Order #WO-8821 for pump P-102A overhaul",
                "SCADA historian temperature and cooling valve position log"
            ],
            "contradictory_evidence": [
                "Backup pump P-102B was functional once manually started, showing utility supply itself was intact"
            ],
            "further_investigation_steps": [
                "Inspect pump P-102A vibration analysis logs from last PM",
                "Evaluate PLC logic for automatic failover trigger on flow sensor failure"
            ],
            "confidence_level": "High Confidence",
            "is_confirmed_by_human": False
        },
        {
            "category": "Method",
            "hypothesis_title": "Unvalidated Mother Liquor Solvent Recycling Ratio",
            "description": "Recycled crystallization mother liquor from recovery tank TK-901 was charged into the batch without HPLC pre-assay verification, potentially carrying forward accumulated impurity precursors.",
            "why_considered": "BMR indicates TK-901 solvent was charged without recording an analytical testing lot number.",
            "supporting_evidence": [
                "BMR solvent charge step missing analytical sign-off"
            ],
            "contradictory_evidence": [
                "Previous batch using fresh solvent also had minor impurity rise, suggesting temperature is the primary driver"
            ],
            "further_investigation_steps": [
                "Sample and run full HPLC impurity profile on recovery tank TK-901 heel",
                "Review SOP-PR-402 on solvent recovery threshold limits"
            ],
            "confidence_level": "Moderate Hypothesis",
            "is_confirmed_by_human": False
        },
        {
            "category": "Measurement",
            "hypothesis_title": "Overdue Calibration of Temperature RTD Sensor RTD-03",
            "description": "Temperature probe RTD-03 in Crystallizer CR-304 had an expired calibration tag (11 months since calibration, SOP requires semi-annual calibration), possibly causing measurement lag or inaccuracy.",
            "why_considered": "Calibration database showed RTD-03 past due date by 5 months.",
            "supporting_evidence": [
                "Metrology calibration tracking record for CR-304"
            ],
            "contradictory_evidence": [
                "Dual sensor probe RTD-04 corroborated the spike to 118°C within +/- 1.2°C"
            ],
            "further_investigation_steps": [
                "Perform immediate 3-point calibration verification of RTD-03 at 0°C, 100°C, and 120°C"
            ],
            "confidence_level": "Moderate Hypothesis",
            "is_confirmed_by_human": False
        },
        {
            "category": "Man",
            "hypothesis_title": "Failure to Document Thermal Excursion in Shift Handover",
            "description": "Shift B operators failed to record the 28-minute thermal excursion in the formal shift handover log, preventing downstream QA and Shift C from taking immediate containment action.",
            "why_considered": "Shift handover log showed 'Normal run' despite SCADA capturing the 118°C excursion.",
            "supporting_evidence": [
                "Discrepancy between SCADA historian logs and paper handover logbook"
            ],
            "contradictory_evidence": [],
            "further_investigation_steps": [
                "Interview shift supervisor and operator on duty during the 14:15 incident",
                "Audit training records on SOP-QA-012 (Deviation Reporting within 2 Hours)"
            ],
            "confidence_level": "High Confidence",
            "is_confirmed_by_human": False
        },
        {
            "category": "Material",
            "hypothesis_title": "Acetic Anhydride Raw Material Degradation or Lower Reactivity",
            "description": "Acetic anhydride reagent lot AA-2026-0129 may have had localized hydrolysis or acetic acid contamination, reducing conversion efficiency.",
            "why_considered": "Standard raw material variability check required under GxP deviation protocol.",
            "supporting_evidence": [
                "Supplier CoA showed 99.4% assay (acceptable but near lower internal alert limit)"
            ],
            "contradictory_evidence": [
                "Lot AA-2026-0129 was successfully used in Batch PARA-2026-088A without OOS results"
            ],
            "further_investigation_steps": [
                "Re-test retain sample of Lot AA-2026-0129 for water content (Karl Fischer) and free acid"
            ],
            "confidence_level": "Low / Needs Verification",
            "is_confirmed_by_human": False
        },
        {
            "category": "Environment",
            "hypothesis_title": "Utility Building Ambient Heatwave Exceeding Chiller Heat Exchanger Capacity",
            "description": "High ambient temperature in the secondary utility pump house caused pump P-102A thermal breaker to trip prematurely.",
            "why_considered": "External ambient temperature recorded at 38°C on 2026-03-14.",
            "supporting_evidence": [
                "Weather monitoring station logged heatwave conditions"
            ],
            "contradictory_evidence": [
                "Chiller building HVAC was operating within normal tolerances"
            ],
            "further_investigation_steps": [
                "Inspect utility house ventilation louvers and thermal trip breaker rating"
            ],
            "confidence_level": "Low / Needs Verification",
            "is_confirmed_by_human": False
        }
    ]

    evidence_items = [
        {
            "item_type": "AVAILABLE",
            "title": "QC HPLC Analytical Certificate #AR-2026-4401",
            "description": "Confirms 0.18% w/w Related Substance Impurity B (4-Aminophenol). Exceeds USP/Ph. Eur. limit of NMT 0.05% w/w.",
            "source_reference": "QC Analytical Laboratory",
            "is_collected": True
        },
        {
            "item_type": "AVAILABLE",
            "title": "SCADA Temperature Historian Trend (CR-304)",
            "description": "Records continuous temperature profile showing 28-minute excursion up to 118°C at 14:15 on 2026-03-14.",
            "source_reference": "Automation & SCADA Historian",
            "is_collected": True
        },
        {
            "item_type": "AVAILABLE",
            "title": "Raw Material CoA - Acetic Anhydride Lot AA-2026-0129",
            "description": "Supplier CoA confirming 99.4% assay and compliance with receiving specifications.",
            "source_reference": "Warehouse Receiving QA",
            "is_collected": True
        },
        {
            "item_type": "MISSING",
            "title": "Recovery Tank TK-901 Mother Liquor HPLC Assay",
            "description": "Pre-charging analytical test result for recycled crystallization solvent to rule out baseline impurity buildup.",
            "source_reference": "Solvent Recovery Unit",
            "is_collected": False
        },
        {
            "item_type": "MISSING",
            "title": "Temperature Probe RTD-03 3-Point Calibration Certificate",
            "description": "Metrology verification to prove RTD-03 accuracy across 0°C - 120°C range following overdue calibration status.",
            "source_reference": "Instrumentation & Metrology Dept",
            "is_collected": False
        },
        {
            "item_type": "MISSING",
            "title": "Shift B Operator Handover Logbook Original Signed Copy",
            "description": "Physical sign-off sheet for 2026-03-14 to investigate omission of thermal deviation reporting.",
            "source_reference": "Production Operations Office",
            "is_collected": False
        },
        {
            "item_type": "MISSING",
            "title": "Cooling Pump P-102A Electrical Breaker Trip Telemetry",
            "description": "Electrical switchgear relay log to verify whether trip was mechanical overload, phase imbalance, or breaker defect.",
            "source_reference": "Electrical Maintenance Engineering",
            "is_collected": False
        }
    ]

    capas = [
        {
            "action_type": "CORRECTIVE",
            "action_description": "Quarantine Batch PARA-2026-089A in SAP/ERP and apply physical yellow quarantine signage to all 48 fiber drums. Initiate formal Material Review Board (MRB) evaluation for potential reprocessing or destruction.",
            "reason_for_recommendation": "Immediate containment to prevent accidental distribution of Out-of-Specification Active Pharmaceutical Ingredient into commercial pharmaceutical supply chains.",
            "supporting_evidence": "QC HPLC Analytical Test Report #AR-2026-4401 showing 0.18% Impurity B.",
            "suggested_department": "Quality Assurance / Warehouse",
            "suggested_priority": "CRITICAL",
            "human_status": "PENDING_REVIEW"
        },
        {
            "action_type": "CORRECTIVE",
            "action_description": "Execute immediate 3-point metrological calibration check of RTD-03 in Crystallizer CR-304 and replace faulty thermal overload relay on Cooling Pump P-102A.",
            "reason_for_recommendation": "Restore critical equipment to validated GxP operational state before resuming production in Unit 3.",
            "supporting_evidence": "Overdue calibration record and Work Order #WO-8821.",
            "suggested_department": "Engineering & Maintenance",
            "suggested_priority": "HIGH",
            "human_status": "PENDING_REVIEW"
        },
        {
            "action_type": "PREVENTIVE",
            "action_description": "Implement automated PLC interlock with audible alarm that triggers auto-switchover from Primary Pump P-102A to Standby Pump P-102B within 15 seconds of flow drop or temperature deviation above 108°C.",
            "reason_for_recommendation": "Eliminates reliance on operator manual intervention during critical exothermic reaction cooling events.",
            "supporting_evidence": "28-minute delay in manual switchover during thermal spike to 118°C.",
            "suggested_department": "Automation & Instrumentation",
            "suggested_priority": "HIGH",
            "human_status": "PENDING_REVIEW"
        },
        {
            "action_type": "PREVENTIVE",
            "action_description": "Revise SOP-PR-402 (Solvent Recovery and Reuse) to mandate mandatory QC HPLC verification testing and automated LIMS release gate before any recycled mother liquor can be charged into reaction vessels.",
            "reason_for_recommendation": "Prevents introduction of uncharacterized impurity precursors from recycled solvent lots.",
            "supporting_evidence": "Missing analytical verification for recovery tank TK-901.",
            "suggested_department": "Production & Quality Control",
            "suggested_priority": "MEDIUM",
            "human_status": "PENDING_REVIEW"
        },
        {
            "action_type": "PREVENTIVE",
            "action_description": "Conduct mandatory refresher training for all Unit 3 production chemists on SOP-QA-012 (Immediate Deviation Reporting and Incident Escalation within 2 Hours).",
            "reason_for_recommendation": "Addresses human procedural breakdown where 28-minute thermal excursion was omitted from shift handover documentation.",
            "supporting_evidence": "Discrepancy between SCADA historian logs and paper handover notes.",
            "suggested_department": "Quality Assurance / Training",
            "suggested_priority": "MEDIUM",
            "human_status": "PENDING_REVIEW"
        },
        {
            "action_type": "EFFECTIVENESS_VERIFICATION",
            "action_description": "Monitor the next five (5) consecutive commercial batches of Paracetamol API for Impurity B levels and audit SCADA cooling response times and BMR deviation compliance. Perform review at 60 days post-implementation.",
            "reason_for_recommendation": "Statistically validates that procedural revisions and automated cooling interlocks effectively prevent recurrence of thermal excursion and impurity generation.",
            "supporting_evidence": "Validation protocol requirement under ICH Q10 Pharmaceutical Quality System.",
            "suggested_department": "Quality Assurance",
            "suggested_priority": "HIGH",
            "human_status": "PENDING_REVIEW"
        }
    ]

    return {
        "five_whys": five_whys,
        "root_causes": root_causes,
        "evidence_items": evidence_items,
        "capa_recommendations": capas
    }
