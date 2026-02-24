# Tech Stack (Future-Proof Baseline)

## Principles
- Compliance-first: every core choice must support Danish/EU data protection, traceability, and auditability.
- Boring over trendy: pick mature tools with strong long-term support and hiring availability.
- Replaceable boundaries: use clean APIs and adapters so integrations (MitID, SKAT/Virk) can evolve without rewrites.
- Managed services first: reduce operational risk and focus engineering time on domain logic.

## Core Stack We Will Use

### Frontend
- Framework: **Next.js (React + TypeScript)**
- UI system: **Tailwind CSS + Radix UI primitives**
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
- Primary database: **PostgreSQL 16 (managed, Azure Database for PostgreSQL)**
- ORM/query layer: **Prisma (with SQL escape hatches for regulated queries)**
- Caching/queue backend: **Redis (Azure Cache for Redis)**
- Document/object storage: **Azure Blob Storage** (S3-compatible abstractions optional)
- Why:
  - PostgreSQL is durable, portable, and proven for transactional systems.
  - Managed services improve reliability and patch posture.

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
- Metrics/tracing: **OpenTelemetry + Azure Monitor / Application Insights**
- Error tracking: **Sentry**
- Audit events: **Append-only audit table + hash/checksum fields**
- Why:
  - Gives legal traceability and operational visibility from day one.

### Security
- Secrets: **Azure Key Vault**
- Encryption at rest: managed disk/db encryption + column-level encryption for sensitive identifiers
- Encryption in transit: TLS 1.2+
- Supply chain: **Dependabot/Renovate + SCA + image scanning**
- Why:
  - Security controls are built into platform operations, not bolted on.

### Infrastructure and Delivery
- Cloud: **Azure (EU region preferred)**
- Compute: **Azure Container Apps** (upgrade path to AKS if needed)
- Containerization: **Docker**
- CI/CD: **GitHub Actions** with protected branches and required checks
- IaC: **Terraform**
- Why:
  - Fast operational start with a clean path to higher scale.
  - Reproducible infrastructure and auditable environment changes.

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
- ADR-003: Azure managed services for compliance and operational maturity.
- ADR-004: Adapter architecture for all external government/identity integrations.

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
