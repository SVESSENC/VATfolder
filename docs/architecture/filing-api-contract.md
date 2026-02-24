# Filing / Amendment / Claim API Contract (minimal)

Common headers
- `X-Correlation-ID`: UUID for tracing the end-to-end request.
- `X-Idempotency-Key`: client-provided idempotency key for POST operations.
- `Authorization`: Bearer token (OAuth2).

1) Submit a filing
- Endpoint: `POST /api/v1/filings`
- Headers: `X-Idempotency-Key` (required), `X-Correlation-ID` (recommended)
- Body (JSON):
  - `taxpayerId` (string)
  - `period` (string, e.g. "2026-Q1")
  - `payload` (object) — submission data
- Response: 202 Accepted
  - Body: `{ "filingId": "<uuid>", "status": "PENDING_VALIDATION" }`
- Behavior: API persists filing, publishes `FilingSubmitted` event to Event Bus, returns `filingId`. Processing continues asynchronously via Orchestrator.

2) Get filing status
- Endpoint: `GET /api/v1/filings/{filingId}`
- Response: 200 OK
  - Body: `{ "filingId": "<uuid>", "status": "PENDING_VALIDATION|VALIDATED|ASSESSMENT_COMPLETED|AMENDABLE|REJECTED|AUDITED", "events": [ ... ] }`

3) Submit an amendment
- Endpoint: `POST /api/v1/filings/{filingId}/amendments`
- Headers: `X-Idempotency-Key`, `X-Correlation-ID`
- Body: `{ "amendmentId"?: "<uuid>", "changes": { ... }, "reason": "..." }`
- Response: 202 Accepted
- Behavior: API creates amendment record, orchestrator replays validation and assessment steps where required, publishes `AmendmentSubmitted` and subsequent events.

4) Submit a claim
- Endpoint: `POST /api/v1/claims`
- Headers: `X-Idempotency-Key`, `X-Correlation-ID`
- Body: `{ "taxpayerId": "...", "filingId"?: "...", "amount": 123.45, "reason": "..." }`
- Response: 202 Accepted
- Behavior: API records claim, publishes `ClaimSubmitted` event; orchestrator or connector sends to External Claims System and records response.

Event envelope (published to Event Bus)
- `eventId`: UUID
- `eventType`: e.g. `FilingSubmitted` / `FilingValidated` / `AssessmentCompleted` / `AmendmentSubmitted` / `ClaimSubmitted` / `AuditRecorded`
- `timestamp`
- `correlationId`
- `causationId` (the event that caused this)
- `source` (service name)
- `payload` (domain object)

Example `FilingSubmitted` payload
```json
{
  "filingId": "uuid",
  "taxpayerId": "xyz",
  "period": "2026-Q1",
  "submittedAt": "2026-02-24T10:00:00Z"
}
```

Event consumer responsibilities
- Ensure idempotent handling of events (use eventId + consumer name).
- Emit compensating events if necessary.
- Persist audit-friendly records for every business event.

Operational notes
- Storage: filings and workflow state in a transactional DB; events in the Event Bus and audit sink.
- Retries: orchestrator implements exponential backoff; connectors use DLQs for failed external calls.
- Observability: logs must include `correlationId` and `X-Idempotency-Key` for tracing submissions across services.

