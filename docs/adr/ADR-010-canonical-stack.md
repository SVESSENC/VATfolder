# ADR-010: Canonical Tech Stack Lock

Status: Accepted

Decision
- Standardize on Vite + React + TypeScript for frontend and NestJS on Node.js 22 LTS for backend.

Rationale
- End-to-end TypeScript reduces drift, simplifies shared contracts, and aligns with team hiring/practices.

Consequences
- `docs/architecture/tech-stack.md` is the source of truth for tooling, runtimes, and versions.
- Exceptions must be recorded as ADRs.
