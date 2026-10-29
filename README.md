# AI-Powered Root Cause Analysis (RCA) Module
### Pharmaceutical Active Pharmaceutical Ingredient (API) Manufacturing Quality Decision Support

An enterprise-grade, GxP-oriented, AI-powered Root Cause Analysis (RCA) and Corrective & Preventive Action (CAPA) web application designed for pharmaceutical quality assurance professionals, manufacturing chemists, and regulatory compliance investigators.

---

## 🌟 Key Capabilities

1. **Intelligent Incident Extraction**
   - Ingests manufacturing deviations, OOS (Out-of-Specification) test alerts, and equipment excursions via **PDF document upload**, **pasted text**, or **email notification body**.
   - Built-in PDF text extraction with automatic scanned document / image detection and graceful OCR requirement prompts.
   - Extracts structured parameters: Incident Title, Description, Batch Number, API/Product Name, Department, Date of Incident, and Observed Quality Issue.
   - **Zero Hallucination Guarantee:** Preserves source fidelity strictly; missing values are explicitly marked as `"Not provided"`.

2. **Automated LangGraph Causal Pipeline**
   - **7-Stage Compiled StateGraph:**
     `START` ➔ `receive_incident_input` ➔ `extract_incident_information` ➔ `validate_extracted_information` ➔ `generate_potential_root_causes` ➔ `identify_missing_evidence` ➔ `generate_capa_recommendations` ➔ `format_human_review_package` ➔ `END`.
   - Generates sequential **5 Whys Progressive Causal Analysis** drilling down from symptom to systemic failure.
   - Synthesizes an interactive **Ishikawa (6M) Fishbone Analysis**:
     - **Man:** Personnel, training, shift handover, procedure adherence
     - **Machine:** Equipment breakdown, utility chilled water, pump overload, PLC interlocks
     - **Method:** BMR tolerances, cooling curve rates, solvent recycling procedures
     - **Material:** Raw material assay, reagent purity, solvent recovery ratios
     - **Measurement:** HPLC baseline drift, RTD sensor calibration, analytical test methods
     - **Environment:** Cleanroom humidity, HVAC differential pressure, heatwave conditions
   - Every AI hypothesis includes rationale, supporting evidence, contradictory data gaps, and confidence levels (`High Confidence`, `Moderate Hypothesis`, `Low / Needs Verification`).

3. **Missing Evidence & Information Gap Matrix**
   - Clearly segregates objective evidence already present in the record from critical missing documents that must be collected (e.g. SCADA historian logs, 3-point RTD calibration certs, BMR execution pages, shift handover logbook sign-offs).
   - Interactive checklist to track evidence collection progress.

4. **Human-in-the-Loop CAPA Program**
   - Generates tiered recommendations:
     - **Corrective Actions:** Immediate containment (batch quarantine in ERP, signages, equipment lockout).
     - **Preventive Actions:** Systemic engineering interlocks, automated PLC failover, SOP revisions, refresher training.
     - **Verification of Effectiveness:** 30/60-day protocol auditing consecutive release batches for recurrence.
   - **Strict GxP Rule:** No CAPA action is automatically approved or executed. Includes an interactive electronic signature modal for formal human quality review and sign-off.

5. **Dual Operation Modes**
   - **Live Groq AI Mode:** High-speed LLM inference using configured Groq API keys and state-of-the-art models (`llama-3.3-70b-versatile`, `gemma2-9b-it`).
   - **Pharmaceutical Simulation / Demo Mode:** Zero-setup offline fallback providing realistic, pre-configured pharmaceutical scenarios (Paracetamol Crystallization OOS, Atorvastatin Calcium Residual Solvent Excursion) if no API key is provided.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Redux Toolkit (`@reduxjs/toolkit`, `react-redux`), Tailwind CSS, Lucide Icons, Vite |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, PyPDF |
| **AI & Orchestration** | LangGraph, LangChain Core, Groq API (`groq`, `langchain-groq`) |
| **Database** | SQLAlchemy 2.0 ORM supporting **PostgreSQL**, **MySQL**, and zero-setup **SQLite** |

---

## 📂 Project Directory Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── investigations.py       # REST API endpoints
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── investigation.py        # SQLAlchemy persistent entities
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── investigation.py        # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── demo_data.py            # Pharma simulation scenarios
│   │   │   ├── groq_service.py         # Groq LLM client & JSON extractor
│   │   │   └── pdf_service.py          # PyPDF parser & scanned OCR detector
│   │   ├── workflow/
│   │   │   ├── __init__.py
│   │   │   ├── graph.py                # Compiled LangGraph StateGraph
│   │   │   ├── nodes.py                # 7 functional pipeline nodes
│   │   │   └── state.py                # RCAWorkflowState definition
│   │   ├── config.py                   # App settings & model configuration
│   │   ├── database.py                 # DB engine & session lifecycle
│   │   └── main.py                     # FastAPI application entrypoint
│   ├── .env                            # Active environment variables
│   ├── .env.example                    # Template environment variables
│   ├── requirements.txt                # Python backend dependencies
│   └── test_workflow.py                # End-to-end integration test suite
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js               # Axios API client
│   │   ├── components/
│   │   │   ├── capa/                   # CAPA table & approval dialog
│   │   │   ├── common/                 # Badges, Toasts, Modals
│   │   │   ├── dashboard/              # Metrics overview, recent table
│   │   │   ├── evidence/               # Evidence & gap matrix
│   │   │   ├── investigation/          # Multi-tab input form & review
│   │   │   ├── layout/                 # Sidebar, Header, Layout
│   │   │   └── rca/                    # 6M Fishbone & 5 Whys accordion
│   │   ├── pages/                      # 5 primary application views
│   │   ├── store/                      # Redux Toolkit store & slices
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js 18+** & **npm**

---

### Step 1: Configure Backend Environment

Navigate into `backend/`:
```bash
cd backend
```

Review or edit `.env`:
```env
# Groq API Configuration
# Get your free key at: https://console.groq.com/keys
GROQ_API_KEY=your_actual_groq_api_key_here

# Supported Models:
# - llama-3.3-70b-versatile (Recommended)
# - gemma2-9b-it
# - llama-3.1-8b-instant
# - mixtral-8x7b-32768
GROQ_MODEL=llama-3.3-70b-versatile

# Database Configuration
# Default: Zero-setup local SQLite file:
DATABASE_URL=sqlite:///./rca_pharma.db

# Or connect to PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/pharma_rca

# Or connect to MySQL:
# DATABASE_URL=mysql+pymysql://user:password@localhost:3306/pharma_rca
```

> **Note:** If `GROQ_API_KEY` is not provided, the system automatically launches in **Pharmaceutical Simulation Mode** with full functionality and sample datasets.

---

### Step 2: Install Backend Dependencies

From the project root or `backend/` directory:
```bash
python -m pip install -r backend/requirements.txt
```

---

### Step 3: Run Backend End-to-End Tests

Verify that database initialization, LangGraph orchestration, and API endpoints work properly:
```bash
python backend/test_workflow.py
```
*(All 9 integration test stages should output `100% SUCCESS`)*.

---

### Step 4: Start the Backend Server

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

---

### Step 5: Start the Frontend Application

Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Frontend will be live at: **`http://localhost:5173`** (or configured port).

---

## 🧪 Sample Incident Text for Immediate Testing

You can paste this text directly into the **New Investigation** page or click the preset button **"Paracetamol API"** in the top bar:

```text
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
```

---

## 🔒 Security, Reliability & Regulatory Disclaimers

1. **GxP Scientific Principle:**
   All root causes generated by the AI models are treated as investigative **hypotheses** until validated with objective analytical chromatography, calibrated physical sensor logs, or BMR verification.
2. **Qualified Human Verification:**
   In compliance with FDA 21 CFR Part 11 and ICH Q10, AI recommendations do not execute or release batches automatically. A qualified Quality Assurance professional must electronically sign off on the findings and approved CAPAs.
3. **No Credential Leakage:**
   API keys are stored strictly on the server in environment variables and are never surfaced to the browser client or logged.
4. **Scanned PDF Handling:**
   PyPDF inspects character density. Documents with zero or fewer than 30 extractable alphanumeric characters trigger an explicit warning that OCR is required rather than silent failure.

---

## ⚖️ Limitations & Future Enhancements

- **OCR for Scanned PDFs:** For scanned image PDFs, text extraction prompts the user to paste text or run OCR. Direct server-side OCR (via Tesseract or Google Cloud Vision) can be integrated as an optional add-on.
- **Enterprise LIMS/ERP Connectors:** Out-of-the-box integration currently targets PostgreSQL, MySQL, and SQLite. Direct bi-directional synchronization with SAP S/4HANA or LabWare LIMS can be enabled via custom webhook endpoints.
