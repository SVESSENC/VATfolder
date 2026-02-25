# ADR-011: Full Containerization with Open-Source Infrastructure

- Date: 2026-02-25
- Status: Accepted
- Supersedes: ADR-003 (Vendor-Managed Hosting Baseline)

## Context

The team requires a fully containerized development and deployment environment where
no tool (Node.js, PostgreSQL, Redis, etc.) needs to be installed on the developer's
local machine. Additionally, the platform must be built entirely on open-source
components to avoid vendor lock-in with any specific cloud provider.

ADR-003 had accepted a vendor-managed hosting baseline. This decision is superseded:
the application layer was already open-source; this ADR extends that principle to
infrastructure choices and mandates Docker as the single runtime dependency.

## Decision

1. **Docker Compose is the canonical local development environment.** Running
   `docker compose up --build` starts the complete stack with no local prerequisites
   beyond Docker Desktop (or Docker Engine).

2. **All infrastructure services must have open-source equivalents:**
   - Database: PostgreSQL 16 (replaces vendor-managed PostgreSQL dependency)
   - Queue/cache: Redis 7 (unchanged)
   - Blob storage: MinIO (replaces vendor-specific blob storage dependency; S3-compatible API)
   - Container orchestration: Docker Compose (dev) / Kubernetes or any OCI-compatible
     platform (production) — not tied to a provider-specific container runtime

3. **Cloud neutrality:** The platform may be deployed on any cloud that offers
   managed PostgreSQL, Redis, and S3-compatible storage, or fully self-hosted.
   No provider is preferred.

4. **Multi-stage Dockerfiles** are used for both `backend` (NestJS) and `frontend`
   (React/Vite → nginx) to support both a hot-reload development stage and an
   optimised production stage from the same file.

5. **Prisma migrations run automatically** on container start via
   `docker-entrypoint.sh` (`prisma migrate deploy`).

## Rationale

- Zero local-install requirement eliminates onboarding friction and environment drift.
- Open-source infra keeps the stack portable across any cloud or on-premise host.
- MinIO's S3-compatible API means the same SDK (`@aws-sdk/client-s3`) works against
  MinIO locally and against any cloud object store in production.
- Multi-stage builds keep production images lean (no devDependencies, no source files).

## Alternatives considered

| Option | Rejected because |
|--------|-----------------|
| Provider-specific managed services (ADR-003) | Cloud lock-in; requires provider account even for local dev |
| Bare-metal local installs | Each developer must manage their own Postgres/Redis versions |
| Dev Containers / Codespaces only | Less flexible; still requires VS Code and a specific remote target |

## Consequences

- Positive: Single `docker compose up` starts the entire stack.
- Positive: Production deployable on any cloud or on-premise Kubernetes.
- Positive: MinIO locally → S3/R2/Wasabi/etc. in production with zero code changes.
- Negative: Docker must be installed (replaces Node.js as the only local prerequisite).
- Negative: `prisma migrate deploy` on every container start adds a few seconds to
  boot time (mitigated by Prisma's no-op behaviour when schema is already current).

## Service map (development)

| Service       | Image                | Internal port | Host port |
|---------------|----------------------|---------------|-----------|
| `postgres`    | postgres:16-alpine   | 5432          | 5432      |
| `redis`       | redis:7-alpine       | 6379          | 6379      |
| `minio`       | minio/minio          | 9000          | 9000      |
| `minio`       | (web console)        | 9001          | 9001      |
| `backend`     | custom NestJS 11     | 3000          | 3000      |
| `frontend`    | custom Vite dev      | 5173          | 5173      |

See `docker-compose.yml` for full configuration and healthchecks.
See `docker-compose.prod.yml` for production overrides (nginx frontend, no console ports).
