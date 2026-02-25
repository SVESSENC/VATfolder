# ADR-003: Vendor-Managed Hosting Baseline (Deprecated)

- Date: 2026-02-24
- Status: Deprecated and superseded by ADR-011

## Context
Platform needs operational reliability, secure defaults, and EU data residency alignment.

## Decision
Prefer a single vendor-managed hosting baseline while keeping application technologies open-source.

## Rationale
- A single managed host can simplify operations and regional compliance controls.
- Open-source application technologies keep architecture portable and reduce vendor lock-in.
- This balances delivery speed with long-term flexibility.

## Consequences
- Positive: Faster path to production readiness.
- Positive: Better portability across providers due to OSS technology choices.
- Negative: Vendor coupling risk remains when selecting a provider-specific managed baseline.
