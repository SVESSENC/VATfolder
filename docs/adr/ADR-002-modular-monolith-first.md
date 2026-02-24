# ADR-002: Modular Monolith First

- Date: 2026-02-24
- Status: Accepted

## Context
Early-stage system with limited team size and evolving requirements.

## Decision
Start with a modular monolith and defer microservices.

## Rationale
- Lower operational complexity at MVP stage.
- Faster iteration with clear in-process module boundaries.
- Easier transactional consistency for compliance workflows.

## Consequences
- Positive: Simpler deployment and debugging.
- Negative: Requires discipline to maintain clean module boundaries.
