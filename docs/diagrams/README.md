# Diagrams Index

## Draw.io diagrams (canonical — open with [app.diagrams.net](https://app.diagrams.net) or the VS Code Draw.io extension)

| # | File | Description | Status |
|---|------|-------------|--------|
| 01 | [01-system-context.drawio](./01-system-context.drawio) | C4 Level-1 system context: actors, VAT Platform boundary, data stores, external integrations | Canonical |
| 02 | [02-container-topology.drawio](./02-container-topology.drawio) | Docker Compose container map: all services, ports, volumes, healthchecks, build stages | Canonical |
| 03 | [03-application-modules.drawio](./03-application-modules.drawio) | NestJS backend module map: API layer, modules, data infra, external adapters | Canonical |
| 04 | [04-submission-sequence.drawio](./04-submission-sequence.drawio) | Submit application flow: synchronous 202 path + asynchronous BullMQ worker path | Canonical |

## How to open Draw.io files

- **Browser**: drag the `.drawio` file to [app.diagrams.net](https://app.diagrams.net)
- **VS Code**: install the [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) extension — `.drawio` files open natively as interactive diagrams

## Mermaid source diagrams (legacy — superseded by Draw.io above where noted)

| File | Description | Status |
|------|-------------|--------|
| [01-system-context.md](./01-system-context.md) | System context (Mermaid flowchart) | Superseded by 01 .drawio |
| [02-container-architecture.md](./02-container-architecture.md) | NestJS module structure (Mermaid) | Superseded by 03 .drawio |
| [03-submission-sequence.md](./03-submission-sequence.md) | Submission sequence (Mermaid sequenceDiagram) | Superseded by 04 .drawio |
| [04-azure-deployment.md](./04-azure-deployment.md) | Azure deployment (Mermaid) | **Superseded by ADR-011** — replaced by 02 .drawio |
| [05-orchestration.md](./05-orchestration.md) | Delivery orchestration — cross-role handoff (process diagram) | Active |
| [06-orchestrator-eventbus.md](./06-orchestrator-eventbus.md) | Orchestrator + Event Bus (proposed target state — ADR-006) | Proposed |
