# ADR-003: Azure Hosting with OSS Application Tooling

- Date: 2026-02-24
- Status: Superseded by ADR-011

## Context
Platform needs operational reliability, secure defaults, and EU data residency alignment.

## Decision
Use Azure as the hosting platform while preferring open-source technologies for application runtime, observability, and secrets where practical.

## Rationale
- Azure provides regional hosting, identity, and operational maturity aligned with compliance needs.
- Open-source application technologies keep architecture portable and reduce vendor lock-in.
- This balances delivery speed with long-term flexibility.

## Consequences
- Positive: Faster path to production readiness.
- Positive: Better portability across providers due to OSS technology choices.
- Negative: Some additional operational overhead compared with fully managed proprietary tooling.
