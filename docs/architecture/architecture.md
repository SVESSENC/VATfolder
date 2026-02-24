**Overview**

This document describes a practical, buildable system for supporting the main steps of Danish VAT (moms) registration and immediate post-registration obligations. It focuses on a minimal-complexity design that meets legal traceability, supports MitID authentication, and is extensible for SKAT/Virk integrations.

**Assumptions**
- Legal and API specifics (SKAT/Virk endpoints, required payloads) will be validated by `researcher` before implementation.
- Users will authenticate with MitID (business/corporate flows where applicable). Confirm MitID product and scope with `researcher`/integrations.
- CVR and company data will be used for pre-fill via public CVR APIs where permitted.

**User workflow (high-level steps mapped to registration tasks)**
1. Validate need to register: present short questionnaire to determine VAT obligation.
2. Collect/verify identity and business data: MitID auth + CVR lookup + supplemental form fields.
3. Gather required documents and selections: registration type, start date, special schemes (OSS, reverse charge), contact details.
4. Validate data client-side and server-side using legal rules (researcher provides ruleset).
5. Submit application: either via direct SKAT/Virk API or generate signed payload/PDF for manual submission.
6. Track submission status and store SKAT responses (confirmation, registration number, follow-up requests).
7. Post-registration: generate compliance checklist, first-period filing reminders, and bookkeeping hints.

**System components**
- Web frontend (SPA) — lightweight React/TypeScript or Vue: forms, flows, status dashboard.
- Backend API — FastAPI (Python) or Node/Express/TypeScript: business logic, validation, integration adapters.
- Auth layer — MitID connector (OIDC/SSO) plus RBAC for internal users.
- Data store — PostgreSQL for core domain data and audit trails.
- Document store — S3-compatible blob store for uploaded docs (encrypted).
- Queue — Redis streams or Azure Service Bus for async tasks (submission, retries, notifications).
- Integration adapters — modular connectors for: MitID auth, CVR lookup, SKAT/Virk submission, e-mail/e-Boks notifications.
- Audit & logging — append-only audit store (immutable events) and structured logs (ELK or Azure Monitor).
- Monitoring & alerting — basic health, failed submissions, and SLA alerts.

**Key data model (entities)**
- User (person) — identities linked to MitID and email.
- Organisation — CVR, legal name, addresses, registration history.
- VATApplication — fields: applicant id, organisation id, registration type, start date, chosen schemes, status, SKAT_reference, created_at, updated_at.
- Document — owner ref, type, checksum, encryption metadata.
- AuditEvent — who, what, when, payload-hash.

**API contracts (examples)**
- POST /applications
  - Request: application payload + attachments refs
  - Response: application id, validation warnings
- GET /applications/{id}
  - Response: full state, status, SKAT_reference if available
- POST /applications/{id}/submit
  - Response: submission result or queued status

Detailed contract schemas will be defined during the `Define API contracts` TODO and validated by `researcher` for required fields.

**Integrations**
- MitID: OIDC flows for user authentication and business authentication. Confirm required scopes and enterprise flows.
- CVR API: pre-fill business data and validate CVR existence.
- SKAT/Virk: final submission endpoint(s) — may be direct API or manual upload. `researcher` to confirm available endpoints and required security (e.g., certificate-based TLS/MTLS, signed payloads).
- e-Boks / email: delivery of confirmations and follow-ups.

**Security, privacy, and compliance**
- Use MitID for strong authentication and link to CVR where possible.
- Encrypt PII at rest (database column-level encryption for personal IDs) and TLS in transit.
- Store minimal data necessary and maintain retention policies aligned with Danish rules — `researcher` and legal counsel to confirm retention period.
- Detailed audit trail for all data changes and submissions (immutable AuditEvent records).
- Access controls: RBAC for internal roles and least privilege for integrations.

**Validation & business rules**
- Business/Legal ruleset owner: `researcher` — must deliver a machine-readable ruleset (YAML/JSON) for server-side validation.
- Validation layers: client-side (UX feedback) + server-side (authoritative) + submit-time (SKAT-specific constraints).

**Testing strategy**
- Unit tests for components and validation rules.
- Integration tests including MitID (stubbed), CVR lookup (mock), and SKAT adapter (contract tests / sandbox where available).
- E2E tests for main registration flows using test users or MitID test environments.
- Compliance regression: verify traceability of legal citations to reactions in the ruleset.

**Deployment and infra recommendations**
- Host on Azure (recommended for Danish customers) or another cloud with EU datacenter residency.
- Containerize services with Docker and orchestrate with Kubernetes or Azure App Service with container support.
- Use managed Postgres (Azure Database for PostgreSQL) and Azure Blob Storage or S3-compatible storage with server-side encryption.
- CI/CD: pipeline for lint/test/build/deploy. Require PR review and automated contract tests before permitting merge to main.

**Observability & runbooks**
- Health endpoints per service; dashboard for submit-queue depth and failed submissions.
- Runbooks for: MitID failures, failed SKAT submissions (retry logic), data breach handling, and retention purge.

**Milestones & estimated timeline (conservative)**
- Week 0–1: Research confirmation (legal endpoints, MitID scope) — `researcher` deliverables.
- Week 2: Define user flows and acceptance criteria — `designer` + `architect`.
- Week 3–4: Implement core backend, DB schema, MitID auth, and basic frontend flow (MVP submission to queued adapter).
- Week 5–6: Integrations with CVR and SKAT adapter (sandbox), document storage and audit.
- Week 7: Testing (integration and E2E) and compliance review by `reviewer`.
- Week 8: Harden, runbook, deploy to production-like environment and handover.

**Acceptance criteria**
- `researcher` confirms mapping of UI flows to legal requirements and provides validation ruleset.
- User can complete registration flow end-to-end in sandbox (submit -> receive confirmation or queued status).
- All PII stored encrypted, audit trail present for all actions, MitID authentication enforced.
- Reviewer sign-off on compliance-critical items.

**Next actions (immediate)**
1. `researcher`: produce legal-scope.md with exact SKAT/Virk submission requirements and desired retention policy.
2. `designer`: draft the minimal flow wireframes for the 7-step user workflow and edge states.
3. `architect`/`developer`: produce initial DB schema and API skeleton for review.

**Responsibilities mapping**
- `researcher`: legal ruleset, SKAT API validation details.
- `architect`: architecture diagram, API contracts, integration patterns.
- `designer`: UX flows, accessibility checks.
- `developer`: implementation, tests, and deployment.
- `reviewer`: compliance sign-off and checklist.

If you want, I will: (a) create `legal-scope.md` stub for `researcher` to fill, (b) generate an initial DB schema and OpenAPI skeleton. Which should I do next?

**Architecture decision log**
- ADR-001 (2026-02-24): Use TypeScript end-to-end for frontend/backend contract consistency.
- ADR-002 (2026-02-24): Start as a modular monolith; defer microservices until scale/ownership boundaries justify it.
- ADR-003 (2026-02-24): Prefer Azure managed services for operational maturity and EU data residency alignment.
- ADR-004 (2026-02-24): Use adapter boundaries for MitID, CVR, SKAT/Virk, and notification integrations.
- ADR-005 (2026-02-24): Choose Node.js + NestJS over Python + FastAPI for this phase; re-evaluate if ML/data-processing exceeds ~30% of backend workload or critical Python-only SDK dependencies emerge.
