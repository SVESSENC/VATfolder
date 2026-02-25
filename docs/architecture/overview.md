# Architecture Overview (Basics)

## Purpose
This folder defines the baseline architecture for the VAT platform, with a clear split between:
- Canonical MVP behavior (`applications` flow with internal queue/ledger processing).
- Proposed future extensions (`filings` and orchestrated event-bus workflows).

## What Is In This Folder
- `architecture.md`: End-to-end architecture narrative, security model, deployment model, milestones, and ADR mapping.
- `system-outline.md`: Fast system snapshot (runtime, workflows, minimal API, references).
- `tech-stack.md`: Technology decisions and rationale.
- `filing-api-contract.md`: Proposed target-state API contract for filings/amendments/claims.

## System At A Glance
- Frontend: React + Vite SPA.
- Backend: NestJS REST API.
- Data: PostgreSQL for transactional state and audit records.
- Async: Redis + BullMQ queues.
- Object storage: MinIO (S3-compatible), swappable in production.
- Integrations: Adapter boundaries for MitID/CVR/SKAT/Virk/e-Boks; stubs in MVP.

## MVP User Flow (7 Steps)
1. Obligation assessment questionnaire.
2. Identity and organization capture.
3. Application drafting and document upload.
4. Rules validation (client + server).
5. Submission into internal queue/ledger.
6. Status tracking and follow-up handling.
7. Post-registration checklist and reminders.

## Key Data Objects
- `users`
- `organisations`
- `vat_applications`
- `documents`
- `audit_events`

## API Shape (High Level)
- Core MVP: `POST/GET/PUT /api/v1/applications...`, validation, submission, queue status.
- Proposed target state: `POST /api/v1/filings`, amendments, claims, event-driven orchestration.

## Review Findings (Docs)
### 1) Auth mode wording can be read as conflicting
- Severity: Medium
- Evidence:
  - `tech-stack.md` presents MitID as primary auth.
  - `architecture.md` and `system-outline.md` state MVP uses internal auth and MitID is post-MVP.
- Risk:
  - New contributors may implement against the wrong auth assumption for MVP.
- Suggested fix:
  - Add explicit labels in `tech-stack.md` (for example: "MVP auth" vs "Target-state auth") to match the other docs.

### 2) Idempotency expectation is not explicit in architecture summaries
- Severity: Low
- Evidence:
  - `filing-api-contract.md` and `api/openapi.yaml` explicitly require `X-Idempotency-Key` for POST flows.
  - `architecture.md` and `system-outline.md` list submit endpoints but do not call out header requirements.
- Risk:
  - Consumers relying only on architecture summaries may miss required request semantics.
- Suggested fix:
  - Add a short "Common headers" section to `architecture.md` and `system-outline.md`.

## Suggested Next Cleanup
1. Align auth wording across all four docs with explicit MVP vs target-state labels.
2. Add one shared "Request headers and idempotency" section and link to OpenAPI for canonical details.
3. Keep this overview as the entry point for new contributors, and link to deep-dive docs.
