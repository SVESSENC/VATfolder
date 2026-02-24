# ADR-004: External Integrations via Adapters

- Date: 2026-02-24
- Status: Accepted

## Context
Government and identity providers may evolve contracts and security requirements over time.

## Decision
Use strict adapter boundaries for MitID, CVR, SKAT/Virk, and notification providers.

## Rationale
- Isolates external API change impact.
- Enables contract testing at integration seams.
- Keeps domain logic independent from provider details.

## Consequences
- Positive: Better maintainability and replaceability.
- Negative: Slight upfront design/implementation overhead.
