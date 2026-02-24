---
title: Orchestrator + Event Bus Architecture
---

```mermaid
flowchart LR
  subgraph UI
    A[Taxpayer or Representative]\n(Self-Service Portal UI) --> B[Portal BFF]
  end

  B --> C[Tax Core API Layer]
  C --> D[Orchestrator Service]\n  D --> E[Validation Service]
  D --> F[Tax Core Engine\n(Rules Engine)]

  C -->|publishes| EB[(Event Bus)]
  D -->|publishes events| EB
  E -->|publishes| EB
  F -->|publishes| EB

  EB --> G[Audit Sink\n(append-only store)]
  EB --> H[Audit and Reporting]
  EB --> I[External Claims System Connector]
  EB --> J[ERP / Bookkeeping Connector]

  style A fill:#f8f0ff,stroke:#a58cff
  style B fill:#f8f0ff,stroke:#a58cff
  style C fill:#efe4ff,stroke:#b88bff
  style D fill:#efe4ff,stroke:#b88bff
  style E fill:#efe4ff,stroke:#b88bff
  style F fill:#efe4ff,stroke:#b88bff
  style EB fill:#fff0f8,stroke:#ffb6e3
  style G fill:#f3f3ff,stroke:#b0b0ff

  click EB "#" "Event Bus (conceptual)"
```
```