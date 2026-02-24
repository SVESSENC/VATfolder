---
title: Orchestrator + Event Bus Architecture (Proposed Target State)
---

This diagram represents a proposed future architecture (ADR-006, status: Proposed), not the canonical MVP runtime.

```mermaid
flowchart LR
  subgraph UI
    A[Taxpayer or Representative]
    B[Self-Service Portal UI]
    C[Portal BFF]
    A --> B --> C
  end

  C --> D[Tax Core API Layer]
  D --> E[Orchestrator Service]
  E --> F[Validation Service]
  E --> G[Tax Core Engine\n(Rules Engine)]

  D -->|publishes| EB[(Event Bus)]
  E -->|publishes| EB
  F -->|publishes| EB
  G -->|publishes| EB

  EB --> H[Audit Sink\n(append-only store)]
  EB --> I[Audit and Reporting]
  EB --> J[External Claims System Connector]
  EB --> K[ERP or Bookkeeping Connector]
```
