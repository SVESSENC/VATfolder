# Diagrams Index

This folder contains the canonical architecture diagrams as Mermaid sources.

## Diagram Set (Overview → Drill-Down)

| # | File | Focus | Scope |
|---|------|-------|-------|
| 01 | [01-system-context.md](./01-system-context.md) | Full system overview | MVP canonical |
| 02 | [02-container-architecture.md](./02-container-architecture.md) | Runtime container topology | MVP canonical |
| 03 | [03-submission-sequence.md](./03-submission-sequence.md) | Submission and async processing flow | MVP canonical |
| 04 | [04-data-audit-traceability.md](./04-data-audit-traceability.md) | Data and audit traceability model | MVP canonical |
| 05 | [05-orchestration.md](./05-orchestration.md) | API surface by capability | MVP + target-state endpoints |
| 06 | [06-orchestrator-eventbus.md](./06-orchestrator-eventbus.md) | Integration evolution (MVP stubs → post-MVP live connectors) | Proposed post-MVP extension |

## Conventions

- Diagram `01` is the entry point and should be read first.
- Diagrams `02` to `05` progressively drill down into implementation specifics.
- Diagram `06` is an explicit future-state evolution path and is not part of canonical MVP runtime behavior.
- Keep endpoint names and path parameters aligned with `api/openapi.yaml`.
