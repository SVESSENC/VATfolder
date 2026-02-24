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
  P -->|deployments & runbooks| Rev
  Rev -->|sign-off / feedback| A

  %% governance notes
  classDef notes fill:#f9f,stroke:#333,stroke-width:1px;
  Notes([Decision rules & acceptance gates:\n- Legal traceability required\n- CI green + infra checks for release\n- Researcher+Architect resolve legal/UX conflicts])
  Notes:::notes
  Notes -.-> R
  Notes -.-> A
  Notes -.-> P
```