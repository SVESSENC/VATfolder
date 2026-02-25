# Development Guide

## Prerequisites

- **Docker Desktop** (or Docker Engine + Compose plugin) — that's it.
  No Node.js, PostgreSQL, or Redis installation required on your local machine.

---

## 1. Start the full stack

```bash
docker compose up --build
```

This starts all services defined in `docker-compose.yml`:

| Service   | URL / port                          | What it is                        |
|-----------|-------------------------------------|-----------------------------------|
| Frontend  | http://localhost:5173               | React SPA (Vite dev server)       |
| Backend   | http://localhost:3000               | NestJS REST API                   |
| Swagger   | http://localhost:3000/api/docs      | Interactive API docs (dev only)   |
| MinIO     | http://localhost:9001               | Blob storage web console          |
| Postgres  | localhost:5432                      | Database (for DB tools/clients)   |
| Redis     | localhost:6379                      | Queue / cache                     |

On first boot, Prisma migrations run automatically and the `vat-documents` MinIO
bucket is created by the `minio-init` one-shot container.

> **Tip:** Use `docker compose up` (without `--build`) on subsequent runs once the
> images are built. Add `--build` whenever you change a `Dockerfile` or `package.json`.

### Stop the stack

```bash
docker compose down
```

To also delete all persistent data (database, blobs, queue):

```bash
docker compose down -v
```

---

## 2. Test login (dev mode)

MitID OIDC is not yet integrated. A dev login endpoint is available when
`NODE_ENV=development`:

1. Open **http://localhost:5173/login**
2. Enter any email, e.g. `test@example.dk`
3. Enter a display name, e.g. `Test User`
4. Click **Sign in**

This calls `POST /api/v1/auth/dev-login`, creates or retrieves a user record,
and issues a JWT stored in `localStorage`.

> Dev login is **disabled** when `NODE_ENV=production`.

---

## 3. Basic workflow

### Register a company for VAT

1. Log in at `/login`
2. Click **+ New Application** on the dashboard
3. **Step 1 — Company**: Enter an 8-digit CVR number and click "Look up"
4. **Step 2 — Obligation**: Fill in annual turnover, business type, and expected start
   date. The backend creates a draft application and runs an obligation assessment.
5. **Step 3 — VAT Details**: Choose registration type, confirm start date, select
   optional VAT schemes (OSS, reverse charge), and enter contact details.
6. **Step 4 — Validate**: Click "Run validation". The backend checks the application
   against the 2026-01 Danish VAT ruleset and returns errors and warnings with legal
   citations. All errors must be resolved.
7. **Step 5 — Review & Submit**: Review the summary and click "Submit to SKAT".
   The application is queued (status → `queued`). A submission ID is shown.

---

## 4. Environment variables

Environment variables for the backend are set directly in `docker-compose.yml` for
development. To customise them:

1. Create a `backend/.env` file (gitignored) based on `backend/.env.example`
2. Restart the compose stack: `docker compose up --build backend`

Key variables:

| Variable         | Default (compose)                          | Description                        |
|------------------|--------------------------------------------|------------------------------------|
| `DATABASE_URL`   | `postgresql://vat:vat@postgres:5432/vatdb` | Postgres connection string         |
| `REDIS_URL`      | `redis://redis:6379`                       | BullMQ queue                       |
| `MINIO_ENDPOINT` | `http://minio:9000`                        | Blob storage endpoint              |
| `JWT_SECRET`     | `dev-secret-change-in-production`          | JWT signing secret                 |
| `CORS_ORIGIN`    | `http://localhost:5173`                    | Allowed CORS origin                |

---

## 5. Running Prisma CLI (migrations, studio)

Exec into the running backend container:

```bash
# Open a shell in the backend container
docker compose exec backend sh

# Inside the container:
npx prisma studio           # Browse data at http://localhost:5555
npx prisma migrate dev      # Create a new migration from schema changes
npx prisma db push          # Push schema directly (dev only, no migration file)
```

---

## 6. API endpoints (quick reference)

| Method | Path                               | Description                                           |
|--------|------------------------------------|-------------------------------------------------------|
| `POST` | `/api/v1/auth/dev-login`           | **[DEV]** Login with email, returns JWT               |
| `GET`  | `/api/v1/auth/me`                  | Current user                                          |
| `GET`  | `/api/v1/organisations?cvr=`       | CVR lookup                                            |
| `GET`  | `/api/v1/applications`             | List my applications                                  |
| `POST` | `/api/v1/applications`             | Create draft application                              |
| `GET`  | `/api/v1/applications/:id`         | Get application                                       |
| `PUT`  | `/api/v1/applications/:id`         | Update draft                                          |
| `POST` | `/api/v1/applications/:id/assess`  | Run obligation assessment                             |
| `POST` | `/api/v1/applications/:id/validate`| Validate against ruleset                              |
| `POST` | `/api/v1/applications/:id/submit`  | Submit to SKAT (async, needs `X-Idempotency-Key`)     |
| `GET`  | `/api/v1/submissions/:id/status`   | Submission status                                     |
| `POST` | `/api/v1/submissions/:id/retry`    | Retry a failed submission                             |
| `POST` | `/api/v1/applications/:id/documents` | Initiate document upload                            |
| `GET`  | `/api/v1/validation/rulesets`      | List validation rulesets                              |

Full interactive docs: **http://localhost:3000/api/docs**

---

## 7. Production build

Use the production compose override to build optimised images:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

This builds:
- Backend: multi-stage NestJS image (no devDependencies, no source files)
- Frontend: Vite build → nginx serving static files + API proxy on port 80

---

## 8. Project structure

```
VATfolder/
├── backend/                   # NestJS API
│   ├── Dockerfile             # dev + prod stages
│   ├── docker-entrypoint.sh   # runs prisma migrate before start
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── common/            # Guards, filters, middleware
│       └── modules/
│           ├── auth/          # JWT auth + dev login
│           ├── applications/  # VAT application CRUD
│           ├── documents/     # Document upload (presigned URLs)
│           ├── validation/    # Ruleset validation engine
│           ├── submissions/   # Async submission to SKAT
│           └── organisations/ # CVR lookup
├── frontend/                  # React + TypeScript (Vite)
│   ├── Dockerfile             # dev + prod (nginx) stages
│   ├── nginx.conf             # Production nginx config + API proxy
│   └── src/
│       ├── api/               # Typed API client
│       ├── context/           # Auth state (React context)
│       └── pages/             # Login, Dashboard, Wizard, Detail
├── docker-compose.yml         # Full dev stack
├── docker-compose.prod.yml    # Production overrides
├── docs/                      # Architecture, ADRs, design specs
└── api/openapi.yaml           # OpenAPI contract
```
