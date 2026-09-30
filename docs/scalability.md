# JanSetu AI — Scalability & High-Availability Architecture

## 1. Executive Summary & Concurrency Target
JanSetu AI is engineered as a resilient **Digital Public Good (DPG)** capable of supporting **at least 100,000 concurrent active users** (citizens browsing, submitting multimodal issues, government officers analyzing geospatial clusters, and policymakers running simulation models).

To achieve sub-second p95 latencies and eliminate single-point bottlenecks, JanSetu AI transitions from a monolithic process to a **stateless, horizontally scalable, multi-tier architecture** with asynchronous worker queues, Redis distributed caching, connection pooling, and circuit breaker resilience.

---

## 2. High-Level Target Topology

```
                                 USERS (100,000+ Concurrent)
                                              |
                   +--------------------------+--------------------------+
                   |                                                     |
             Mobile App (React Native/PWA)                         Web Command Center
                   |                                                     |
                   +--------------------------+--------------------------+
                                              |
                                      Global CDN & WAF
                                 (Cloudflare / Cloud Armor)
                                              |
                                     Layer 7 Load Balancer
                                     (HAProxy / AWS ALB / GCLB)
                                              |
                         +--------------------+--------------------+
                         |                    |                    |
                    API Instance 1       API Instance 2       API Instance N
                         |                    |                    |
                         +--------------------+--------------------+
                                              |
                     +------------------------+------------------------+
                     |                        |                        |
             PostgreSQL Cluster         Redis Cluster          BullMQ Job Queues
          (Primary + Read Replicas)  (Cache & Pub/Sub)                 |
                     |                        |             +----------+----------+
                     |                        |             |                     |
                Object Storage                |         AI Workers         Analytics Workers
              (Signed Direct URLs)            |    (Gemini Multimodal)    (Hotspots & Gaps)
                                              |             |                     |
                                              +-------------+---------------------+
```

---

## 3. Core Architectural Pillars

### 3.1. Stateless Horizontal API Scaling
- Backend instances do not store sticky session state or in-memory citizen records.
- All authentication is performed via cryptographically signed JWT tokens with short-lived access lifespans (15 mins) and Redis-backed refresh token rotation.
- Any API node can process any request from any citizen or government officer interchangeably.
- Instances scale dynamically from **2 baseline instances** to **20+ instances** based on CPU, memory, and RPS thresholds.

### 3.2. Asynchronous Non-Blocking Processing
- **Critical Rule**: Expensive AI multimodal operations, translations, and spatial recalculations NEVER block HTTP request lifecycles.
- When a citizen submits a request:
  1. Record is instantly persisted in the primary database with status `SUBMITTED`.
  2. An `Idempotency-Key` is recorded in Redis to prevent double submissions from mobile retries.
  3. Job is dispatched to the `ai-analysis` queue.
  4. API immediately returns HTTP `201 Created` in **< 150 ms**.
  5. Asynchronous worker pool pulls the job, runs Gemini analysis through a Circuit Breaker, updates the record to `AI_VERIFIED`, and broadcasts the update via Redis Pub/Sub to Server-Sent Events (SSE).

### 3.3. Multi-Tier Distributed Caching (Redis)
- **Dashboard Overview**: Precomputed by background analytics workers and cached with a 10-minute TTL. Target p95 latency: `< 45 ms`.
- **Geospatial Map Layers**: Bounding-box and zoom-level queries are cached with 2-minute TTLs.
- **AI Deduplication Cache**: Identical input sentences query cache keys before hitting external Gemini models, saving quotas and reducing response times from 3.2s to 8ms.
- **Cache Invalidation**: Target pattern invalidations (`dashboard:*`, `requests:*`, `map:*`) trigger immediately upon administrative updates or status transitions.

### 3.4. Distributed Rate Limiting
- Backed by Redis sliding window counters across all API instances.
- **Tiers**:
  - Anonymous IP limit: 100 requests/minute
  - Authenticated user limit: 600 requests/minute
  - Citizen request submissions: 30 requests/minute (anti-abuse protection)
  - AI analysis & Copilot: 20 requests/minute
  - Administrative endpoints: 300 requests/minute

### 3.5. Circuit Breaker & Graceful Degradation
- Prevents cascading timeouts if external providers (Gemini Multimodal, Speech Transcription, Geocoding) experience elevated latency or downtime.
- Three operational states:
  - **CLOSED**: Normal operation.
  - **OPEN**: Failure count exceeds threshold (5 failures in 30s). Downstream calls fail-fast with deterministic fallback models.
  - **HALF-OPEN**: Probes the external API after a 30s cooldown before restoring traffic.

### 3.6. Database Scaling & PostGIS Spatial Indexing
- **Connection Pooling**: PgBouncer or Prisma connection pool configured with `min: 5`, `max: 50`, `idleTimeout: 30s`.
- **Spatial Queries**: PostGIS geometry indexes on coordinates (`(latitude, longitude)`) allow bounding box queries to filter millions of points in `< 25 ms`.
- **Cursor Pagination**: Replaces unbounded `OFFSET` queries with cursor-based pagination (`?cursor=REQ-2026-4819&limit=25`), enabling consistent execution times on tables with tens of millions of rows.
- **Read Replicas**: Write operations hit the Primary database; high-volume read endpoints (dashboard overview, public maps, analytics queries) route to read replicas.

### 3.7. Map Bounding-Box & Zoom-Level Clustering
- To prevent browser memory crashes from rendering 100,000+ points simultaneously:
  - **Zoom 1–6 (National)**: Server returns state-level aggregated cluster centroids (max 50 points).
  - **Zoom 7–10 (District/Block)**: Server clusters by district and priority score.
  - **Zoom 11+ (Local)**: Server serves granular citizen markers strictly bounded by the active viewport bounding box (`bbox=minLng,minLat,maxLng,maxLat`).

---

## 4. Production Deployment & Reliability
- **Health Probes**: `/health` (deep dependency checks), `/ready` (traffic acceptance), `/live` (process liveness).
- **Graceful Shutdown**: On `SIGTERM` / `SIGINT`, servers stop accepting new traffic, allow existing requests to finalize, drain worker tasks, and cleanly close database and Redis pools.
- **Zero-Downtime Rolling Updates**: Kubernetes Deployment / Cloud Run revision rolling updates ensure uninterrupted availability during code releases.
