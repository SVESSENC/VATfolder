# ADR-009: Idempotency Standard

Status: Accepted

Decision
- All async/mutable submit endpoints must accept an `X-Idempotency-Key` header provided by clients.
- Services must record idempotency keys transactionally and ensure exactly-once processing semantics where possible.

Scope
- Applies to endpoints that create or mutate domain state asynchronously (submissions, filings, claims, corrections).

Consequences
- OpenAPI must document `X-Idempotency-Key` on relevant operations.
- Clients are responsible for generating collision-resistant keys.
- Consumers should return 409 on conflicting reuse semantics where appropriate.
