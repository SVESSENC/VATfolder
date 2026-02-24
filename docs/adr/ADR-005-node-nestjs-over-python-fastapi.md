# ADR-005: Node.js + NestJS over Python + FastAPI (Current Phase)

- Date: 2026-02-24
- Status: Accepted (Revisit Trigger Defined)

## Context
Both stacks are viable for this platform; near-term priority is consistency and structured backend modularity.

## Decision
Use Node.js + NestJS for current delivery phase instead of Python + FastAPI.

## Rationale
- Aligns with end-to-end TypeScript strategy.
- NestJS offers strong conventions for modular architecture, guards, and policy layers.
- Simplifies shared validation/types across frontend and backend.

## Revisit Triggers
Re-evaluate this decision if any become true:
- More than ~30% of backend workload is ML/data-processing.
- Team composition shifts significantly toward Python.
- A critical integration requires a Python-only SDK with high wrapping risk.

## Consequences
- Positive: Faster full-stack delivery and reduced contract drift.
- Negative: Less direct access to Python-native data/ML ecosystems.
