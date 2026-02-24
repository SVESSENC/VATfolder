# ADR-003: Azure Managed Services

- Date: 2026-02-24
- Status: Accepted

## Context
Platform needs operational reliability, secure defaults, and EU data residency alignment.

## Decision
Prefer Azure managed services for core runtime, storage, and observability.

## Rationale
- Strong managed offerings for Postgres, Redis, secrets, and monitoring.
- Reduces operational burden and patching risk.
- Aligns with regional hosting/compliance expectations.

## Consequences
- Positive: Faster path to production readiness.
- Negative: Increased cloud-provider coupling.
