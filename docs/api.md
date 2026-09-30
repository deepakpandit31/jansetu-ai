# JanSetu AI REST API Documentation

Base URL: `/api`

### 1. Authentication
- `POST /api/auth/register` - Create a citizen or officer account
- `POST /api/auth/login` - Authenticate using phone/email and password
- `GET /api/auth/me` - Get profile of authenticated user
- `POST /api/auth/demo-switch` - Switch demo officer/citizen role

### 2. Citizen Requests
- `GET /api/requests` - Query requests with filters (category, state, district, urgency, status)
- `GET /api/requests/:id` - Fetch single request with media, analysis, and status history
- `POST /api/requests` - Submit a new citizen request (requires auth)
- `PATCH /api/requests/:id/status` - Update request status with officer comment

### 3. AI Services
- `POST /api/ai/analyze-request` - Run multi-stage AI extraction on citizen statement
- `POST /api/ai/transcribe` - Speech-to-text transcription with dialect recognition
- `POST /api/ai/copilot` - Query AI Copilot grounded in platform database

### 4. Hotspots & Analytics
- `GET /api/hotspots` - List demand hotspots with 5-factor priority score breakdown
- `GET /api/dashboard/overview` - National KPIs, category distribution, and urgency charts

### 5. AI Recommendations & Simulation
- `GET /api/recommendations` - List AI-generated infrastructure recommendations
- `PATCH /api/recommendations/:id/status` - Record officer approval / review decision
- `POST /api/simulation` - Run What-If simulation with coverage and ROI metrics
