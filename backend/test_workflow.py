"""
Comprehensive End-to-End Test for PharmaRCA Backend API and LangGraph Workflow.
"""
import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.services.demo_data import SAMPLE_INCIDENT_TEXTS

def run_tests():
    print("==================================================================")
    print("STARTING PHARMARCA END-TO-END WORKFLOW INTEGRATION TEST")
    print("==================================================================")
    
    with TestClient(app) as client:
        # Test 1: Health check
        print("\n[TEST 1] Testing /api/health...")
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        data = res.json()
        print(f"-> Health OK: status={data['status']}, groq_configured={data['groq_configured']}, model={data['model']}")

        # Test 2: System Config
        print("\n[TEST 2] Testing /api/config...")
        res = client.get("/api/config")
        assert res.status_code == 200, f"Config check failed: {res.text}"
        cfg = res.json()
        print(f"-> Config OK: mode='{cfg['mode']}', supported={cfg['supported_models']}")

        # Test 3: Sample Incidents
        print("\n[TEST 3] Testing /api/investigations/samples...")
        res = client.get("/api/investigations/samples")
        assert res.status_code == 200
        samples = res.json()["samples"]
        assert len(samples) >= 2, "Expected at least 2 sample incidents"
        print(f"-> Samples OK: Loaded {len(samples)} pharmaceutical scenarios.")

        # Test 4: Run LangGraph full workflow on Paracetamol OOS incident
        print("\n[TEST 4] Running LangGraph RCA & CAPA Workflow (/api/investigations/run-workflow)...")
        paracetamol_text = SAMPLE_INCIDENT_TEXTS["crystallization_oos"]
        workflow_res = client.post("/api/investigations/run-workflow", json={
            "raw_text": paracetamol_text,
            "input_source": "pasted_text"
        })
        assert workflow_res.status_code == 200, f"Workflow failed: {workflow_res.text}"
        pkg = workflow_res.json()
        
        inc = pkg.get("incident_data", {})
        five_whys = pkg.get("five_whys", [])
        root_causes = pkg.get("root_causes", [])
        evidence_items = pkg.get("evidence_items", [])
        capas = pkg.get("capa_recommendations", [])

        print(f"-> Workflow Extracted Title: {inc.get('incident_title')}")
        print(f"-> Batch Number: {inc.get('batch_number')}")
        print(f"-> Product: {inc.get('product_name')}")
        print(f"-> 5 Whys Levels: {len(five_whys)}")
        print(f"-> Root Cause Hypotheses: {len(root_causes)} (6M Fishbone)")
        print(f"-> Evidence Items: {len(evidence_items)}")
        print(f"-> CAPA Recommendations: {len(capas)}")

        assert len(five_whys) >= 3, "Expected at least 3 levels in 5 whys"
        assert len(root_causes) >= 4, "Expected at least 4 root cause hypotheses"
        assert len(capas) >= 3, "Expected at least 3 CAPA recommendations"

        # Test 5: Persist Investigation into Database
        print("\n[TEST 5] Saving Investigation to Database (/api/investigations)...")
        create_payload = {
            "title": inc.get("incident_title", "Paracetamol OOS Investigation"),
            "description": inc.get("incident_description", "Thermal excursion during crystallization"),
            "raw_input_text": paracetamol_text,
            "input_source": "pasted_text",
            "batch_number": inc.get("batch_number", "PARA-2026-089A"),
            "product_name": inc.get("product_name", "Paracetamol API"),
            "department": inc.get("department", "Unit 3"),
            "incident_date": inc.get("incident_date", "2026-03-14"),
            "observed_issue": inc.get("observed_issue", "OOS Impurity B"),
            "status": "RCA_COMPLETED",
            "ai_model_used": inc.get("ai_model_used", "llama-3.3-70b-versatile"),
            "is_demo_mode": pkg.get("is_demo_mode", False),
            "five_whys_data": five_whys,
            "root_causes": root_causes,
            "evidence_items": evidence_items,
            "capa_recommendations": capas
        }
        create_res = client.post("/api/investigations", json=create_payload)
        assert create_res.status_code == 201, f"Create failed: {create_res.text}"
        inv_created = create_res.json()
        inv_id = inv_created["id"]
        print(f"-> Saved Investigation successfully. UUID: {inv_id}")

        # Test 6: Retrieve Investigation by ID
        print(f"\n[TEST 6] Fetching Investigation by ID (/api/investigations/{inv_id})...")
        get_res = client.get(f"/api/investigations/{inv_id}")
        assert get_res.status_code == 200
        inv_fetched = get_res.json()
        assert inv_fetched["id"] == inv_id
        assert len(inv_fetched["root_causes"]) == len(root_causes)
        assert len(inv_fetched["capa_recommendations"]) == len(capas)
        print(f"-> Fetched successfully with {len(inv_fetched['root_causes'])} causes & {len(inv_fetched['capa_recommendations'])} CAPAs.")

        # Test 7: Human QA Electronic Signature Verification
        print(f"\n[TEST 7] Testing Qualified Human QA Verification (/api/investigations/{inv_id}/verify)...")
        verify_payload = {
            "reviewer_name": "Dr. Eleanor Vance, QA Compliance Director",
            "review_notes": "Reviewed and confirmed. Pump P-102A bearing failure verified via SCADA. Immediate batch quarantine upheld.",
            "mark_as_verified": True
        }
        verify_res = client.post(f"/api/investigations/{inv_id}/verify", json=verify_payload)
        assert verify_res.status_code == 200
        inv_verified = verify_res.json()
        assert inv_verified["is_human_verified"] is True
        assert inv_verified["human_reviewer_name"] == "Dr. Eleanor Vance, QA Compliance Director"
        assert inv_verified["status"] == "APPROVED"
        print(f"-> Verification successful: Status changed to '{inv_verified['status']}', Signed by '{inv_verified['human_reviewer_name']}'.")

        # Test 8: Single CAPA Approval
        print("\n[TEST 8] Testing Human Review for Single CAPA Action...")
        first_capa = inv_fetched["capa_recommendations"][0]
        capa_id = first_capa["id"]
        capa_res = client.post(f"/api/investigations/{inv_id}/capa/{capa_id}/approve", json={
            "action": "APPROVED",
            "reviewer_name": "Dr. Eleanor Vance",
            "notes": "Approved for immediate execution by Operations & Maintenance."
        })
        assert capa_res.status_code == 200
        capa_data = capa_res.json()
        assert capa_data["human_status"] == "APPROVED"
        print(f"-> Single CAPA action '{capa_id}' successfully signed off as APPROVED.")

        # Test 9: List investigations table
        print("\n[TEST 9] Testing Investigation Listing Table (/api/investigations)...")
        list_res = client.get("/api/investigations")
        assert list_res.status_code == 200
        inv_list = list_res.json()
        assert len(inv_list) >= 1
        print(f"-> Listed {len(inv_list)} investigations. Batch '{inv_list[0]['batch_number']}' found.")

        print("\n==================================================================")
        print("ALL END-TO-END PHARMARCA INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
        print("==================================================================")

if __name__ == "__main__":
    run_tests()
