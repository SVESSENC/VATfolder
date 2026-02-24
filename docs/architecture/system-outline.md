**System Outline - VAT Registration Platform**

Purpose
- A single, authoritative document describing system architecture, user journeys, API surface, data model, integrations, security, testing, and operational runbooks for the Danish VAT registration product.

Scope
- Covers core user flows: obligation assessment, application drafting, validation, submission to SKAT, corrections/claims, and auditing.
- Links to implementation artifacts in `docs/architecture`, `api`, and `database`.

High-level overview
- Users authenticate with MitID, may prefill data from CVR, complete a short questionnaire to assess VAT obligation, fill and upload required documents, validate using the legal ruleset, then submit to SKAT (or produce signed payload/PDF for manual submission). The system tracks lifecycle and produces post-registration tasks.

User workflows (seven steps)
1. Assessment: call the obligation engine; receive decision and citations.
2. Identity and Organisation: MitID OIDC, CVR lookup, link accounts.
3. Draft Application: create/modify application; upload documents.
4. Validate: server-side legal ruleset run; present warnings/errors with citations.
5. Submit: queue or send to SKAT adapter; store submission payload and SKAT response.
6. Post-Submission: track status, handle follow-ups or info requests.
7. Post-Registration: produce compliance checklist and reminders.

Minimal API surface (summary)
- Auth: `POST /auth/oidc/initiate`, `GET /auth/oidc/callback`
- Organisation: `GET /organisations?cvr={cvr}`
- Obligation: `POST /assess/obligation`
- Applications: `POST /applications`, `GET /applications/{id}`, `PUT /applications/{id}`
- Documents: `POST /applications/{id}/documents`, `GET /applications/{id}/documents/{docId}`
- Validation: `POST /applications/{id}/validate`, `GET /validation/rulesets`
- Submissions: `POST /applications/{id}/submit`, `GET /submissions/{submissionId}/status`
- Corrections and Claims: `POST /applications/{id}/corrections`, `POST /applications/{id}/claims`
- Audit: `GET /audit?objectType=VATApplication&objectId={id}`

Data model (key entities)
- `users`
- `organisations`
- `vat_applications`
- `documents`
- `audit_events`

Diagrams
- See `docs/diagrams/README.md` for diagram index and individual Mermaid files.

References (workspace files)
- `docs/architecture/architecture.md`
- `docs/architecture/tech-stack.md`
- `api/openapi.yaml`
- `database/db_schema.sql`
- `team.mcp.yaml`

Document history
- Created: 2026-02-24
- Updated: 2026-02-24
- Author: architect
