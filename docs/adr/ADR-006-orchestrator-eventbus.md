# ADR-006: Orchestrator + Event Bus + Rules Engine for Filing Workflows

Status: Proposed

Context
- The VAT portal must support multi-step flows: filing → validation → assessment → amendment → claim → audit.
- Flows are long-running, require retries, durable state, auditable events, and integration with external systems (ERP, Claims system).

Decision
- Introduce a lightweight Orchestrator service (e.g., Temporal or another workflow engine) to coordinate long-running stateful workflows.
- Introduce an Event Bus (Kafka, NATS, or RabbitMQ) for async integration between components and to capture all business events for audit/reporting.
- Introduce a Rules Engine module (versioned rule artifacts) used by the `Tax Core Engine` to evaluate tax rules and produce assessments.

Consequences
- Positive
  - Supports durable, observable workflows with clear lifecycle and retries.
  - Decouples components via events, improving resilience and scalability.
  - Rules can be versioned and tested independently, enabling safe rule updates.
- Negative / Trade-offs
  - Additional operational complexity (orchestrator hosting, message broker, monitoring).
  - Requires discipline for idempotency, correlation IDs, and eventual consistency patterns.

Implementation Notes
- Events: define canonical event types (FilingSubmitted, FilingValidated, AssessmentCompleted, AmendmentSubmitted, ClaimSubmitted, AuditRecorded). Publish events to Event Bus with a standard envelope including `correlationId`, `causationId`, `idempotencyKey`, `timestamp`, and `source`.
- Orchestrator responsibilities: start workflow on FilingSubmitted, call Validation Service, call Tax Core Engine, manage retries/timeouts, emit events, persist workflow state.
- Rules engine: store rule artifacts in a versioned store (Git or blob storage) and provide APIs for rule evaluation and test harnesses.
- Audit: stream all events to an append-only audit sink (immutable store) and index for `Audit and Reporting`.

Recommended next steps
1. Prototype a simple orchestrator workflow for a sample filing (validation → assessment → audit).
2. Define event schemas and implement a lightweight event envelope library used across services.
3. Add observability requirements (correlation, tracing, metrics) to the principal services.

References
- ADR-003-vendor-managed-services-deprecated.md (historical context; superseded by ADR-011)
