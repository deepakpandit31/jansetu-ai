# JanSetu AI Engine Specification

## 1. Model Configuration
JanSetu AI utilizes **Google Gemini 3.8 Flash** (`gemini-3.8-flash`) as the core multimodal reasoning model.
- Initialization uses the official `@google/genai` TypeScript SDK on the server side.
- Telemetry header `User-Agent: aistudio-build` is set in `httpOptions`.
- Server-side only: the `GEMINI_API_KEY` is never transmitted to the browser.

## 2. Ingest Analysis Pipeline
When a citizen speaks or types, the pipeline executes the following 14-step workflow:
1. Dialect / Language Detection (13 supported Indian languages)
2. Audio speech transcription
3. English semantic normalization
4. Physical defect extraction
5. Secondary societal impact determination (e.g., EMERGENCY_HEALTHCARE_ACCESS, STUDENT_ATTENDANCE)
6. Sector category classification
7. Urgency rating assignment (LOW, MEDIUM, HIGH, CRITICAL)
8. Explainability rationale generation
9. Affected population estimation based on local demographics
10. Entity recognition
11. Geocoding verification (device GPS takes precedence over textual names)
12. Semantic similarity vector matching with existing reports
13. Confidence calculation (0.80 - 0.99)
14. Interactive citizen verification modal (Citizen must confirm before database write)

## 3. Grounded Decision Copilot
The AI Copilot operates under strict grounding:
- Queries active records from `InMemoryDatabase` (or PostgreSQL).
- Explicitly cites data tables, data period (e.g., "Q3 2026"), and active filters.
- Rejects hallucinations; if data for a village is unavailable, it explicitly requests an engineering survey.
