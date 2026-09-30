# JanSetu AI Architecture Specification

## 1. High-Level System Overview
JanSetu AI is designed as a Digital Public Good (DPG) to solve the disconnect between citizen demands and government infrastructure capital allocation.

```
[ Citizen Voice / Text / Photo ]
                │
                ▼
[ JanSetu Multimodal Ingest (apps/mobile) ]
                │
                ▼
[ Gemini 3.8 Flash Analysis & Normalization ]
    ├── Language Detection (13 Languages)
    ├── Primary Defect Classification
    ├── Secondary Public Impact Derivation
    └── Urgency Assessment
                │
                ▼
[ PostGIS Spatial Clustering Engine ]
    ├── Distance-Weighted Demand Hotspots
    ├── Census & Demographic Normalization
    └── Existing Asset Gap Calculation
                │
                ▼
[ Priority Scoring Engine (0-100) ]
    ├── Demand Score (/25)
    ├── Population Impact (/25)
    ├── Infrastructure Gap (/20)
    ├── Urgency (/15)
    └── Accessibility (/15)
                │
                ▼
[ Decision Support & Simulation (apps/web) ]
    ├── AI Recommendation Dossiers (Human-in-the-Loop)
    ├── Interactive What-If Scenario Simulator
    └── JanSetu Grounded Copilot
```

## 2. Key Components
- **Unified Monorepo**: Shared schemas and types guarantee synchronization across citizen and officer interfaces.
- **Multimodal Pipeline**: Pre-recorded speech or live Web Audio is processed with speech recognition and structured JSON extraction.
- **Explainability Constitution**: AI is positioned strictly as decision-support. No automated capital approvals are permitted without officer sanction.
