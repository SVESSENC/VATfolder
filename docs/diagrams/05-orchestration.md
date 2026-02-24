# Delivery Orchestration (Process Diagram)

This diagram describes cross-role delivery handoffs. It is not the runtime service architecture.

```mermaid
flowchart LR
  subgraph Intake
    R[Researcher\n(legal-scope.md)]
  end
  subgraph Architecture
    A[Architect\n(architecture.md)]
  end
  subgraph Design
    D[Designer\n(design-specs.md)]
  end
  subgraph Implementation
    Dev[Developer\n(implementation/)]
  end
  subgraph Platform
    P[DevOps\n(deployment-manifests/)]
  end
  subgraph Review
    Rev[Reviewer\n(review-report.md)]
  end

  R -->|legal constraints| A
  A -->|API contracts| D
  D -->|design specs| Dev
  Dev -->|code + tests| P
  P -->|deployments + runbooks| Rev
  Rev -->|sign-off + feedback| A

  classDef notes fill:#f5f5f5,stroke:#333,stroke-width:1px;
  Notes([Decision rules and acceptance gates:\n- Legal traceability required\n- CI green plus infra checks for release\n- Researcher and Architect resolve legal/UX conflicts])
  Notes:::notes
  Notes -.-> R
  Notes -.-> A
  Notes -.-> P
```
