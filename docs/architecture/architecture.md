**Overview**

This document describes a practical, buildable system for supporting the main steps of Danish VAT (moms) registration and immediate post-registration obligations. It focuses on a minimal-complexity design that meets legal traceability and uses integration adapter stubs in MVP, with live MitID/SKAT/Virk integrations deferred to post-MVP.

**Quick start (containerized)**

The entire stack runs in Docker. No local installs are required beyond Docker Desktop (or Docker Engine + Compose plugin).

```
# Development (hot-reload, local ports exposed)
docker compose up --build

# Production-optimised build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

| URL | Service |
|-----|---------|
| http://localhost:5173 | Frontend (React/Vite dev server) |
| http://localhost:3000 | Backend API + Swagger (`/api/docs`) |
| http://localhost:9001 | MinIO web console (dev only) |

**Assumptions**
- Legal and API specifics (SKAT/Virk endpoints, required payloads) will be validated by `researcher` before post-MVP integration rollout.
- MVP authentication uses internal auth and adapter stubs; live MitID business/corporate flow is post-MVP.
- MVP CVR prefill uses an internal adapter stub; live CVR lookup is post-MVP.
- This document follows tech-stack.md as source of truth.
- Canonical MVP runtime follows modular monolith plus outbox plus Redis/BullMQ worker flow (ADR-002, ADR-010).
- Orchestrator/Event Bus expansion is documented as proposed target state (ADR-006, status: Proposed).

**User workflow (high-level steps mapped to registration tasks)**
1. Validate need to register: present short questionnaire to determine VAT obligation.
2. Collect and verify identity and business data: internal auth plus CVR adapter stub plus supplemental form fields.
3. Gather required documents and selections: registration type, start date, special schemes (OSS, reverse charge), contact details.
4. Validate data client-side and server-side using legal rules (`researcher` provides ruleset).
5. Submit application: store canonical submission payload in internal submission ledger/queue (no external dispatch in MVP).
6. Track submission status and store internal acknowledgement and processing states.
7. Post-registration: generate compliance checklist, first-period filing reminders, and bookkeeping hints.

**System components**

_Infrastructure (Docker containers — see `docker-compose.yml`)_
- PostgreSQL 16 — core domain data and immutable audit trail.
- Redis 7 — BullMQ queue backend and cache.
- MinIO — S3-compatible blob storage for uploaded documents (swap for any S3-compatible service in production with zero code changes).

_Application (Docker containers — custom images with multi-stage builds)_
- Frontend (SPA) — Vite + React + TypeScript: registration forms, status dashboard, wizard flow.
- Backend API — NestJS on Node.js 22 LTS: business logic, validation, integration adapters; Swagger at `/api/docs`.
- Auth layer — JWT/RBAC for internal users in MVP; MitID OIDC connector remains as post-MVP adapter boundary.
- Queue and async processing (canonical MVP) — BullMQ worker flow with outbox pattern (Redis-backed).
- Event bus and dedicated orchestrator (proposed target state) — deferred until ADR-006 is accepted.

_Cross-cutting_
- Integration adapters — modular connector boundaries for MitID auth, CVR lookup, SKAT/Virk submission, e-mail/e-Boks notifications; all run as stubs in MVP.
- Audit and logging — append-only AuditEvent records and structured logs (OpenTelemetry + Loki).
- Monitoring and alerting — health endpoints, submit-queue depth, and SLA alerts.

**Key data model (entities)**
- User (person) - identities linked to MitID and email.
- Organisation - CVR, legal name, addresses, registration history.
- VATApplication - fields: applicant id, organisation id, registration type, start date, chosen schemes, status, SKAT_reference, created_at, updated_at.
- Document - owner ref, type, checksum, encryption metadata.
- AuditEvent - who, what, when, payload-hash.

**API contracts (examples)**
- POST /api/v1/applications
  - Request: application payload plus attachment refs
  - Response: application id, validation warnings
- GET /api/v1/applications/{applicationId}
  - Response: full state, status, SKAT_reference if available
- POST /api/v1/applications/{applicationId}/submit
  - Response: submission result or queued status
- POST /api/v1/filings
  - Response: 202 accepted for extended filing workflow (proposed target-state contract)
- POST /api/v1/claims
  - Response: 202 accepted for extended claim workflow (proposed target-state contract)

Full contract schemas are defined in `docs/architecture/filing-api-contract.md` and validated by `researcher` for required fields.

**Integrations**
- MVP integration policy: all external integrations are stubbed behind adapters.
- MitID: OIDC flows for user authentication and business authentication (post-MVP rollout). Confirm required scopes and enterprise flows.
- CVR API: pre-fill business data and validate CVR existence (post-MVP rollout).
- SKAT/Virk: final submission endpoint(s) - may be direct API or manual upload (post-MVP rollout). `researcher` to confirm available endpoints and required security (e.g., certificate-based TLS/MTLS, signed payloads).
  - Webhook security: callbacks from SKAT must be validated using a signature header (for example `X-SKAT-Signature`) and a timestamp header (for example `X-SKAT-Timestamp`). Consumers must reject replayed requests outside an acceptable window and return 401/403 on signature failure.
- e-Boks or email: delivery of confirmations and follow-ups.

**Security, privacy, and compliance**
- Use MitID for strong authentication and link to CVR where possible.
- Encrypt PII at rest (database column-level encryption for personal IDs) and TLS in transit.
- Store minimal data necessary and maintain retention policies aligned with Danish rules - `researcher` and legal counsel to confirm retention period.
- Detailed audit trail for all data changes and submissions (immutable AuditEvent records).
- Access controls: RBAC for internal roles and least privilege for integrations.

**Validation and business rules**
- Business/legal ruleset owner: `researcher` - must deliver a machine-readable ruleset (YAML/JSON) for server-side validation.
- Validation layers: client-side (UX feedback) plus server-side (authoritative) plus submit-time (SKAT-specific constraints).

**Testing strategy**
- Unit tests for components and validation rules.
- Integration tests including MitID/CVR/SKAT adapter stubs in MVP, plus contract tests against live provider sandboxes in post-MVP hardening.
- End-to-end tests for main registration flows using test users or MitID test environments.
- Compliance regression: verify traceability of legal citations to reactions in the ruleset.

**Container topology (ADR-011)**

All services run in Docker; no local tool installation is required beyond Docker.
Run `docker compose up --build` to start the complete development stack.

| Service    | Image                | Dev port(s)       | Purpose                        |
|------------|----------------------|-------------------|--------------------------------|
| postgres   | postgres:16-alpine   | 5432              | Primary database               |
| redis      | redis:7-alpine       | 6379              | BullMQ queue + cache           |
| minio      | minio/minio          | 9000 / 9001       | S3-compatible blob storage     |
| backend    | custom NestJS 11     | 3000              | REST API + business logic      |
| frontend   | custom Vite / nginx  | 5173 (dev) / 80   | React SPA                      |

See `docker-compose.yml` (development) and `docker-compose.prod.yml` (production overrides).

**Deployment and infra recommendations**
- **Dev:** `docker compose up --build` — zero local prerequisites beyond Docker (ADR-011).
- **Production:** deploy container images on any OCI-compatible platform. Recommended open-source-friendly options: Hetzner + managed k8s, Scaleway, DigitalOcean Managed Kubernetes, K3s on bare-metal, or any cloud with managed PostgreSQL + Redis (EU region required for GDPR/data residency).
- **Blob storage:** MinIO locally → swap for any S3-compatible service in production (Cloudflare R2, Backblaze B2, Wasabi, AWS S3, self-hosted MinIO cluster) — the application uses the standard S3 SDK and requires no code changes.
- **CI/CD:** GitHub Actions pipeline — lint / test / build / push images / deploy. PR review and automated contract tests required before merge to main.

**Observability and runbooks**
- Health endpoints per service; dashboard for submit-queue depth and failed submissions.
- Runbooks for MitID failures, failed SKAT submissions (retry logic), data breach handling, and retention purge.

**Milestones and estimated timeline (conservative)**
- Week 0-1: Research confirmation (legal endpoints, MitID scope) - `researcher` deliverables.
- Week 2: Define user flows and acceptance criteria - `designer` plus `architect`.
- Week 3-4: Implement core backend, DB schema, internal auth, and basic frontend flow (MVP submission to internal queued adapter).
- Week 5-6: Harden stubbed adapter boundaries; optional provider sandbox exploration for post-MVP rollout.
- Week 7: Testing (integration and E2E) and compliance review by `reviewer`.
- Week 8: Harden, runbook, deploy to production-like environment and handover.

**Acceptance criteria**
- `researcher` confirms mapping of UI flows to legal requirements and provides validation ruleset.
- User can complete registration flow end-to-end in MVP (submit to receive internal confirmation or queued status).
- All PII stored encrypted, audit trail present for all actions, and adapter boundaries ready for post-MVP MitID enforcement.
- Reviewer sign-off on compliance-critical items.

**Next actions (immediate)**
1. `researcher`: produce legal-scope.md with exact SKAT/Virk submission requirements and desired retention policy.
2. `designer`: draft the minimal flow wireframes for the 7-step user workflow and edge states.
3. `architect` and `developer`: produce initial DB schema and API skeleton for review.

**Responsibilities mapping**
- `researcher`: legal ruleset, SKAT API validation details.
- `architect`: architecture diagram, API contracts, integration patterns.
- `designer`: UX flows, accessibility checks.
- `developer`: implementation, tests, and deployment.
- `reviewer`: compliance sign-off and checklist.

**Architecture decision log**
- See docs/adr/README.md for ADR index and full records.
- Accepted baseline: ADR-002-modular-monolith-first.md, ADR-007-api-versioning.md, ADR-008-auth-by-default.md, ADR-009-idempotency.md, ADR-010-canonical-stack.md, ADR-011-containerization.md.
- ADR-003 (vendor-managed hosting baseline) superseded by ADR-011.
- Proposed extension: ADR-006-orchestrator-eventbus.md.
