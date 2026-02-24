# ADR-008: Auth-By-Default Policy

Status: Accepted

Context
- Several endpoints are public (auth initiation/callback) and others require MitID.

Decision
- All endpoints require MitID by default. Public exceptions must explicitly declare `security: []`.

Rationale
- Safety-first policy reduces accidental exposure of protected resources.

Consequences
- Top-level OpenAPI `security` will require `mitid` for all operations.
- Public endpoints (e.g., OIDC initiation/callback) will explicitly set `security: []`.

Implementation
- Update `api/openapi.yaml` with a global `security` requirement.
- Mark public endpoints with `security: []`.
