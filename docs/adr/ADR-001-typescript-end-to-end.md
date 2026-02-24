# ADR-001: TypeScript End-to-End

- Date: 2026-02-24
- Status: Accepted

## Context
The system has a TypeScript frontend and a backend that can be implemented in multiple languages.

## Decision
Use TypeScript end-to-end across frontend and backend.

## Rationale
- Improves contract consistency between UI and API.
- Reduces schema drift and integration defects.
- Improves delivery speed for full-stack teams.

## Consequences
- Positive: Better shared tooling and type reuse.
- Negative: Less flexibility for Python-native ecosystems.
