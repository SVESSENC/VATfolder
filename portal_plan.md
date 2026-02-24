**Self-Service Portal Plan — VAT Registration**

Goal
- Provide a secure, self-service portal where users authenticate with MitID, complete VAT registration flows, upload documents, validate against legal rules, submit to SKAT (or queue), and track status.

Scope (MVP)
- MitID login + session management
- Dashboard showing applications and statuses
- Create/edit application wizard (7-step flow)
- Document upload with presigned URLs
- Server-side validation with citation-aware results
- Submit to SKAT adapter (queue + status tracking)
- Audit trail and receipt delivery

Pages / Screens
- Landing / Info
- Login (MitID redirect) / Account link
- Dashboard: applications list, status, create-new
- Application wizard: (1) Obligation questionnaire, (2) Identity & CVR, (3) Business details, (4) Documents, (5) Validation, (6) Review, (7) Submit
- Application detail: timeline, documents, audit events
- Admin operator view: queued submissions, retries

Auth & Sessions
- Use MitID OIDC for authentication. Flow: `POST /api/v1/auth/oidc/initiate` -> MitID -> `GET /api/v1/auth/oidc/callback` -> issue session JWT (short-lived) + refresh token (secure storage).
- Internal service auth: mTLS or signed tokens for integrations (SKAT adapter).

Frontend (recommended tech)
- React + TypeScript, React Router, state via React Query or Redux (query cache for apps list).
- File uploads via presigned S3 URLs; client shows progress and validation metadata.
- Accessibility: keyboard navigation, labels, focus management, contrast.

- Backend (recommended tech)
- NestJS on Node.js 22 LTS following `api/openapi.yaml` contracts.
 - Endpoints required (mapped to earlier API outline):
   - Auth: `/api/v1/auth/oidc/initiate`, `/api/v1/auth/oidc/callback`, `/api/v1/auth/session` (renew)
   - Applications: `/api/v1/applications` CRUD, `/api/v1/applications/{id}/validate`, `/api/v1/applications/{id}/assess`, `/api/v1/applications/{id}/submit`
   - Documents: `/api/v1/applications/{id}/documents` (create -> return presigned upload URL)
   - Organisation/CVR: `/api/v1/organisations?cvr=` (prefill)
   - Submissions: `/api/v1/submissions/{id}/status`, `/api/v1/integrations/skats/callback`
   - Admin: `/api/v1/queue/queued-submissions`, `/api/v1/submissions/{id}/retry`

Data & Storage
- Use `vat_applications` JSONB for form payloads, `documents` point to blob storage keys.
- Encrypt sensitive fields; consider application-layer encryption for CPR/PII.

Validation & Ruleset
- Server-side validation endpoint returns structured errors/warnings together with `citationKeys` provided by `researcher`.
- Client displays warnings inline and shows full citation list on review step.

Submission Flow
- On submit: backend validates again, stores signed backup (`submission_payload`), enqueues submission job.
- Worker sends to SKAT adapter with idempotency key; adapter records `skat_reference` and posts webhook to `/integrations/skats/callback`.

Audit & Receipts
- Every user action writes an `AuditEvent` (actor, action, object, payload-hash) to `audit_events`.
- On successful submission store receipt and deliver via email/e-Boks.

Errors & Retries
- Implement retry policy for transient SKAT errors; expose operator retry endpoint.
- Show meaningful remediation steps to user when `needs_info` status is returned.

Security
- Enforce MitID auth for all user-facing routes. Use short-lived session JWTs and server-side session store for revocation.
- RBAC for operator/admin endpoints.
- Store secrets (MitID client secret, SKAT certs) in a secrets vault.

Testing
- Unit tests for validation rules and UI components.
- Integration tests for auth (stubbed MitID), CVR, SKAT adapter (sandbox).
- E2E for full flow using test accounts.

Deployment
- Dev, staging, prod environments. Use managed Postgres and blob storage in EU region.
- CI pipeline: build -> test -> deploy to dev; manual gating for staging->prod.

Monitoring & Runbooks
- Monitor queue depth, failed submission rate, auth failures.
- Runbooks: MitID outage, SKAT adapter failures, reported data incidents.

Timeline (suggested, parallel work)
- Week 0: UX flow & API contract finalization (`designer`, `architect`).
- Week 1–2: Implement MitID auth, session APIs, and skeleton frontend routing.
- Week 3: Implement application CRUD, document upload (presigned URLs), and DB migrations.
- Week 4: Server-side validation + assessment engine integration (ruleset).
- Week 5: SKAT adapter integration, submission worker, and webhook handling.
- Week 6: Testing, operator UI, and deploy to staging.

Next immediate steps I can do now
1. Create `legal-scope.md` stub for `researcher` to fill (SKAT endpoints, required fields, retention). 
2. Scaffold minimal NestJS server with auth and `/api/v1/applications` endpoints from `api/openapi.yaml`.
