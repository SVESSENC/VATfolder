# Tech Stack (Future-Proof Baseline)

## Principles
- Compliance-first: every core choice must support Danish/EU data protection, traceability, and auditability.
- Boring over trendy: pick mature tools with strong long-term support and hiring availability.
- Replaceable boundaries: use clean APIs and adapters so integrations (MitID, SKAT/Virk) can evolve without rewrites.
- Cloud-neutral and OSS-first: every component has an open-source self-hosted equivalent; Docker Compose is the canonical dev runtime and the stack deploys on any cloud or bare-metal Kubernetes without code changes.

## Core Stack We Will Use

### Frontend
- Framework: **Vite + React + TypeScript**
- Routing: **React Router**
- UI system: **Tailwind CSS**
- Forms/validation: **React Hook Form + Zod**
- Why:
  - Type-safe UI and API contracts.
  - Excellent ecosystem longevity and team availability.
  - Fast iteration on complex, stateful registration flows.

### Backend
- Runtime: **Node.js 22 LTS**
- API framework: **NestJS (TypeScript)**
- API style: **REST (OpenAPI-first)**
- Validation: **Zod + class-validator at boundaries**
- Background jobs: **BullMQ (Redis-backed)**
- Why:
  - Strong modular architecture for compliance-heavy domains.
  - First-class support for adapters, guards, and policy enforcement.
  - TypeScript end-to-end reduces integration drift.

### Identity and Access
- Primary auth: **MitID via OIDC/SAML integration adapter**
- Session/token handling: **OAuth 2.1 / OIDC best practices**
- Internal authorization: **RBAC + policy checks (OPA-ready design)**
- Why:
  - Meets strong-auth requirements while keeping internals provider-agnostic.

### Data Layer
- Primary database: **PostgreSQL 16** — Docker in dev (`postgres:16-alpine`); any managed PostgreSQL in prod
- ORM/query layer: **Prisma** (with SQL escape hatches for regulated queries)
- Caching/queue backend: **Redis 7** — Docker in dev (`redis:7-alpine`); any managed Redis in prod
- Document/object storage: **MinIO** (self-hosted, S3-compatible API via `@aws-sdk/client-s3`) — swap for any S3-compatible service in prod (Cloudflare R2, Backblaze B2, AWS S3, etc.) with zero application code changes
- Why:
  - PostgreSQL is durable, portable, and proven for transactional and audit-heavy systems.
  - Redis and MinIO expose identical APIs locally and in every managed/cloud environment — no conditional code paths per environment.

### Integrations
- Integration pattern: **Adapter layer + outbox pattern + retry queues**
- Targets:
  - MitID
  - CVR data source
  - SKAT/Virk submission endpoints
  - Email/e-Boks notification provider
- Why:
  - External APIs change; adapters isolate change and reduce systemic risk.

### Observability and Operations
- Logs: **Structured JSON logs (OpenTelemetry-compatible)**
- Metrics/tracing: **OpenTelemetry + Prometheus + Grafana + Tempo**
- Log aggregation: **Loki**
- Audit events: **Append-only audit table + hash/checksum fields**
- Why:
  - Gives legal traceability and operational visibility from day one.

### Security
- Secrets: **HashiCorp Vault** (self-hosted; Docker-compatible; provider-agnostic)
- Encryption at rest: managed disk/db encryption + column-level encryption for sensitive identifiers
- Encryption in transit: TLS 1.2+
- Supply chain: **Dependabot/Renovate + SCA + image scanning**
- Why:
  - Security controls are built into platform operations, not bolted on.

### Infrastructure and Delivery
- Local dev: **Docker Compose** — `docker compose up --build` starts the full stack; no local installs required beyond Docker (ADR-011)
- Production: any OCI-compatible platform — Docker Swarm, K3s, or managed Kubernetes (Hetzner, DigitalOcean, Scaleway, GKE, EKS); EU datacenter required for GDPR/data residency
- Containerization: **Docker** with multi-stage Dockerfiles — shared `development` (hot-reload) and `production` (optimised, no devDependencies) build stages
- CI/CD: **GitHub Actions** with protected branches and required checks
- IaC: **Terraform**
- Why:
  - Zero local-install requirement eliminates onboarding friction and environment drift.
  - Identical container images flow from dev → CI → prod; no per-environment runtime surprises.
  - Cloud-neutral stack keeps vendor lock-in risk low; choose or switch provider based on cost and data-residency rules.

### Testing and Quality Gates
- Unit tests: **Vitest / Jest**
- Integration tests: **Testcontainers + mocked external adapters**
- E2E: **Playwright**
- API contract tests: **OpenAPI schema validation in CI**
- Why:
  - Regression resistance for compliance-critical flows.

## Version and Lifecycle Policy
- Use LTS runtimes only (Node LTS, PostgreSQL major versions with managed support).
- Patch dependencies weekly; security fixes within 48 hours.
- Quarterly upgrade window for non-breaking platform updates.
- Annual architecture review tied to legal/compliance updates.

## Explicit Non-Goals (for now)
- No microservices split at MVP; start as a modular monolith.
- No event streaming platform (Kafka) unless throughput/organizational scale requires it.
- No multi-cloud deployment until regulatory or resilience requirements demand it.

## Key Risks and Mitigations
- Risk: MitID/SKAT interface constraints may force protocol changes.
  - Mitigation: strict adapter boundaries and contract tests.
- Risk: Compliance requirements evolve.
  - Mitigation: rules engine inputs in versioned YAML/JSON + audit trails.
- Risk: Premature complexity.
  - Mitigation: modular monolith first, with clear extraction seams.

## Architecture Decision Log Seed
- ADR-001: TypeScript end-to-end for faster delivery and contract consistency.
- ADR-002: Modular monolith before microservices.
- ADR-003: Azure hosting with OSS application tooling. (**Superseded by ADR-011**)
- ADR-004: Adapter architecture for all external government/identity integrations.
- ADR-011: Full containerization with open-source infrastructure — Docker Compose for dev, cloud-neutral OCI runtime for prod.

## Why Not Python/FastAPI (For This Project)
- We chose TypeScript end-to-end to keep frontend/backend contracts in one language and reduce integration drift.
- NestJS gives stronger built-in structure for larger teams (modules, guards, DI conventions), which helps compliance-heavy domains.
- Shared validation/types across UI and API are simpler with a single TS toolchain.

### FastAPI Is Still a Strong Option
- Better fit if the core product becomes data science/ML heavy.
- Better fit if team expertise is primarily Python and delivery speed would be higher.
- Better fit if we need Python-native legal/rules processing libraries that are hard to replicate in TS.

### Decision Boundary
- Stay with TS/NestJS unless one of these becomes true:
  - More than ~30% of backend logic is ML/data-processing.
  - Hiring/team composition shifts heavily toward Python.
  - A critical integration SDK is Python-only and high-risk to wrap.
