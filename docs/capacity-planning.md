# JanSetu AI — Capacity Planning & Resource Sizing

## 1. Concurrency & Throughput Modeling

| Metric | Target Specification | Design Dimension |
| :--- | :--- | :--- |
| **Peak Concurrent Users** | 100,000 active users | 85% mobile citizens, 15% government analysts/officers |
| **User Activity Distribution** | 70% passive browsing / map view<br>20% reading notifications / status checks<br>10% submitting requests or simulations | Average 1 request per active user every 20 seconds |
| **Target System RPS** | **5,000 requests/sec** (Nominal Peak)<br>**10,000 requests/sec** (Surge Peak) | CDN absorbs 60% of static/cached read traffic |
| **P95 Latency Target** | **< 200 ms** (Cached reads)<br>**< 500 ms** (Database writes) | Uncached complex queries < 800 ms |
| **Error Budget / Availability** | **99.95% Availability** | Max allowable unplanned downtime: 21.6 mins/month |

---

## 2. Infrastructure Sizing for 100,000 Concurrent Users

### 2.1. API Cluster (Stateless Express/Node.js Nodes)
- **Node Specs**: 4 vCPU, 8 GB RAM per instance.
- **Node Throughput**: ~500 RPS per container (with keep-alive and connection reuse).
- **Required Baseline Nodes**: 10 instances (5,000 RPS).
- **Auto-Scaling Envelope**: Min: 4 instances (off-peak), Max: 25 instances (disaster/surge peak).
- **CPU Target**: Auto-scale trigger at 65% sustained CPU utilization.

### 2.2. Database Tier (PostgreSQL + PostGIS)
- **Primary (Write) Instance**:
  - vCPU: 16 vCPU
  - Memory: 64 GB RAM
  - Storage: 1 TB NVMe SSD (Provisioned IOPS: 10,000 IOPS)
- **Read Replicas**:
  - Quantity: 2 read replicas (zone-redundant)
  - vCPU: 8 vCPU, 32 GB RAM each
  - Role: Dashboard aggregate queries, national geospatial bounding box lookups, historical analytics.
- **Connection Pool Strategy**:
  - PgBouncer configured in transaction pooling mode.
  - Max client connections: 5,000.
  - Server database pool: 120 dedicated backend connections.

### 2.3. Redis Cluster (Cache, Rate Limiting & Pub/Sub)
- **Topology**: 3-node Redis cluster with automatic failover (Master + 2 Replicas).
- **Memory Allocation**: 16 GB RAM.
  - Dashboard Precomputed Cache: ~50 MB
  - Rate Limiter Sliding Windows: ~400 MB (100k active keys)
  - Map Bounding-Box Cache: ~1.2 GB
  - Idempotency & Session Keys: ~800 MB
  - Headroom & Buffer: ~13.5 GB
- **Throughput Capability**: 80,000 operations/sec at sub-millisecond latencies.

### 2.4. Asynchronous Worker Fleet
- **AI Multimodal Workers**:
  - Dedicated pool of 10 worker containers (2 vCPU, 4 GB RAM each).
  - Concurrency: 10 jobs per worker = 100 concurrent AI pipelines.
  - Rate limiting & circuit breakers prevent Gemini API quota starvation.
- **Analytics & Hotspot Workers**:
  - 2 worker containers running scheduled re-clustering jobs every 5 minutes.
- **Notification Workers**:
  - 4 worker containers capable of dispatching 1,000 notifications/sec.

---

## 3. Storage & Bandwidth Estimation

### 3.1. Object Storage (Citizen Media)
- Average image attachment: 1.2 MB (compressed on mobile before upload).
- Estimated citizen uploads: 25,000 media files / day.
- Daily storage ingestion: ~30 GB / day.
- Annual storage requirement: ~11 TB / year.
- Direct-to-storage signed URLs eliminate binary throughput through API servers.

### 3.2. Network Bandwidth
- Outbound CDN bandwidth: ~120 Mbps peak (HTML, JS, CSS, vector map tiles).
- Inbound API bandwidth: ~45 Mbps peak (JSON payloads).
- CDN cache hit ratio: **94.2%** for static assets and public geospatial assets.

---

## 4. Bottleneck Identification & Mitigation Matrix

| Potential Bottleneck | Failure Condition | Mitigation Strategy |
| :--- | :--- | :--- |
| **Gemini API Rate Limits** | Sudden surge of 10,000 citizens submitting voice/photos | BullMQ backpressure queue + circuit breaker + fallback deterministic NLP model |
| **Database Connection Exhaustion** | 100k users connecting simultaneously | PgBouncer connection multiplexer + stateless JWT verification |
| **Map Rendering Freeze** | Browser attempting to render 50,000 DOM markers | Dynamic server-side zoom clustering + bounding-box viewport clipping |
| **Large Table Offset Scanning** | `SELECT * FROM requests OFFSET 200000` | Strictly enforced cursor pagination (`?cursor=...&limit=25`) |
| **Double Submissions on Flaky 3G** | Citizen taps "Submit" 5 times on network lag | Client `Idempotency-Key` checked in Redis cache before DB write |
