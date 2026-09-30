# JanSetu AI Database & PostGIS Specification

## 1. ORM & Engine
- **Database Engine**: PostgreSQL 16+ with PostGIS spatial extension.
- **ORM**: Prisma ORM (`apps/server/src/db/schema.prisma`).
- **High-Availability Fallback**: Embedded `InMemoryDatabase` with spatial Haversine distance calculations and query index caching for offline and containerized development.

## 2. Spatial Indexes
- `latitude` and `longitude` fields are indexed with PostGIS GIST indexes:
  ```sql
  CREATE INDEX idx_citizen_requests_geom ON "CitizenRequest" USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
  CREATE INDEX idx_hotspots_geom ON "Hotspot" USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
  ```
- Fast bounding box and radial queries (e.g., `ST_DWithin(geom, point, 25000)`).

## 3. Core Entities
1. `User` - Authentication, role permissions (CITIZEN, DISTRICT_OFFICER, STATE_OFFICER, NATIONAL_OFFICER, ANALYST, ADMIN).
2. `CitizenRequest` - Core citizen submissions with multilingual text, media, GPS coordinates, and status histories.
3. `Hotspot` - Clustered demand hotspots with multi-factor breakdown.
4. `AIRecommendation` - Explainable infrastructure recommendations with human review state.
5. `InfrastructureAsset` - Operational government assets (hospitals, schools, substations, water plants).
6. `AuditLog` - Immutable security and status audit trail.
