# JANSETU AI
### *From Citizen Voice to Smarter Infrastructure*

**JanSetu AI** is an AI-powered Digital Public Good (DPG) platform designed to convert large-scale citizen voice, text, photo, and multilingual feedback into evidence-backed infrastructure priorities, demand hotspots, transparent recommendations, and what-if simulations for government planners.

---

## 🏛️ System Architecture

JanSetu AI is organized as a unified monorepo consisting of:

1. **Citizen Mobile Application** (`apps/mobile`):
   - Multilingual voice, text, and photo reporting across 13 official Indian languages (Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu).
   - Real-time speech-to-text with AI extraction preview.
   - Interactive confirmation: Citizen inspects AI interpretation before submission.
   - Live status tracking timeline (Submitted ➔ AI Verified ➔ Under Review ➔ Assigned ➔ Action Planned ➔ In Progress ➔ Completed).
   - Privacy-preserving Community Pulse aggregator.

2. **Government Web Command Center** (`apps/web`):
   - Executive KPI command center (Total Submissions, Critical Issues, Active Hotspots, Infrastructure Gaps, AI Recommendations).
   - Geospatial intelligence layers (Demand, Hotspots, Assets, Gaps, Projects).
   - Request verification table with deep inspector and audio review.
   - Explainable Demand Hotspots with 5-factor priority score breakdown.
   - Transparent AI Recommendations engine with human-in-the-loop review.
   - Interactive What-If Scenario Simulator with before-and-after coverage metrics.
   - Grounded JanSetu AI Copilot querying live platform metrics.
   - Data Sources Registry and immutable Audit Logs.

3. **Shared Backend & Intelligence Engine** (`apps/server` & `packages/`):
   - Express REST API with JWT authentication and Role-Based Access Control (RBAC).
   - PostgreSQL / PostGIS database schema with Prisma ORM.
   - Gemini 3.8 multimodal analysis pipeline with fallback civic intelligence.
   - Transparent 5-factor priority scoring engine.

---

## 📂 Monorepo Folder Structure

```
jan-setu-ai/
  ├── apps/
  │   ├── mobile/             # Citizen React Native / Expo application
  │   ├── web/                # Government Web Command Center
  │   └── server/             # Express.js REST API & PostGIS intelligence
  ├── packages/
  │   ├── shared/             # Shared TypeScript types, 13-language i18n, constants
  │   └── validation/         # Zod schemas for request validation & RBAC
  ├── docs/                   # Engineering architecture, API, AI, and DB guides
  ├── server.ts               # Production & Dev server entry point (port 3000)
  ├── package.json            # Root workspaces configuration
  ├── metadata.json           # Application identity & permissions
  └── .env.example            # Environment variables template
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
- `PORT=3000`
- `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jansetu_ai"`
- `JWT_SECRET="jansetu-super-secret-jwt-key"`
- `GEMINI_API_KEY=""` (Automatically supplied in Google AI Studio or configured via .env)
- `AI_DEMO_MODE=false` (Set to true to force deterministic demo mode offline)

### 3. Running in Development
```bash
npm run dev
```
The unified platform dev server will launch at:
`http://localhost:3000`

---

## 🎯 Canonical Demo Walkthrough (Section 57)

1. Open the Citizen Mobile App view in the top navigation.
2. Select **हिन्दी (Hindi)**.
3. Tap the **🎙️ Speak Voice** button.
4. Record or click the test prompt:
   > *"हमारे गांव में सड़क बहुत खराब है और बारिश के समय एम्बुलेंस नहीं आ पाती।"*
5. AI extracts:
   - **Language**: Hindi
   - **Primary Category**: Road Infrastructure
   - **Secondary Impact**: Emergency Healthcare Access
   - **Urgency**: High
   - **Location**: Barmer, Rajasthan
6. Citizen verifies and confirms the details.
7. Request is submitted to the backend REST API with ID (e.g., `REQ-2026-0081`).
8. Switch to the **Government Dashboard**.
9. See the request live in the requests table and clustered into **Chohtan-Shivnagar Hotspot #1**.
10. Open **AI Recommendations** to inspect evidence-grounded DPR proposal `REC-2026-01`.
11. Run the **What-If Simulator** to project coverage expansion from 45% to 78% for ~31,700 additional residents.
