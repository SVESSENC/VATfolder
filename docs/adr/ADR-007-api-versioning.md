# ADR-007: API Versioning Strategy

Status: Accepted

Context
- OpenAPI presently contains a mix of versioned paths (`/api/v1/...`) and unversioned paths.
- Consumers and gateways need a single, predictable versioning strategy.

Decision
- Use URI versioning with `/api/v1` prefix for all public HTTP endpoints.

Rationale
- Clear visible versioning at HTTP layer simplifies routing, caching, and API lifecycle.
- Works with existing gateways and is easy for clients to adopt.

Consequences
- All paths in `api/openapi.yaml` must be normalized to start with `/api/v1`.
- Server base URLs remain unchanged; API paths are authoritative.

Alternatives
- Using Accept header or media-type versioning — rejected for simplicity and operational clarity.

Implementation
- Normalize `api/openapi.yaml` paths to include `/api/v1`.
- Update `docs/architecture/system-outline.md` to match the OpenAPI paths.
- Document in README and reference this ADR.
