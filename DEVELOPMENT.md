# Development Guide

## Prerequisites

- Node.js 20+ (22 LTS recommended)
- PostgreSQL 15+ running locally (or Docker)
- `npm` or `pnpm`

---

## 1. Database setup

### Option A — Docker (quickest)
```bash
docker run -d \
  --name vat-postgres \
  -e POSTGRES_USER=vat \
  -e POSTGRES_PASSWORD=vat \
  -e POSTGRES_DB=vatdb \
  -p 5432:5432 \
  postgres:15-alpine
```

### Option B — Local PostgreSQL
Create a database called `vatdb` and a user with access.

---

## 2. Backend setup

```bash
cd backend

# Install dependencies
npm install

# Copy env template
cp .env.example .env
# Edit .env if your DB credentials differ from the defaults

# Push schema to DB (creates all tables)
npm run db:push

# Start in dev mode (hot reload)
npm run start:dev
```

Backend runs at **http://localhost:3000**
Swagger docs at **http://localhost:3000/api/docs**

---

## 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend runs at **http://localhost:5173**
All `/api/*` requests are proxied to the backend automatically.

---

## 4. Test login (dev mode)

Since MitID OIDC is not yet integrated, a dev login endpoint is available:

1. Open **http://localhost:5173/login**
2. Enter any email address, e.g. `test@example.dk`
3. Enter a display name, e.g. `Test User`
4. Click **Sign in**

This calls `POST /api/v1/auth/dev-login`, creates or retrieves the user,
and issues a JWT that is stored in `localStorage`.

> The dev login endpoint is **disabled** when `NODE_ENV=production`.

---

## 5. Basic workflow

### Register a company for VAT

1. Log in at `/login`
2. Click **+ New Application** on the dashboard
3. **Step 1 — Company**: Enter an 8-digit CVR number and click "Look up"
   - If the company exists in the DB it will be shown
   - If not, a new organisation record will be created
4. **Step 2 — Obligation**: Fill in annual turnover, business type, and
   expected start date. The backend will create a draft application and run
   an obligation assessment.
5. **Step 3 — VAT Details**: Choose registration type (standard / reverse
   charge / non-resident), confirm start date, select optional VAT schemes
   (OSS, reverse charge), and enter contact details.
6. **Step 4 — Validate**: Click "Run validation". The backend checks the
   application against the 2026-01 Danish VAT ruleset and returns errors
   and warnings with legal citations. All errors must be resolved.
7. **Step 5 — Review & Submit**: Review the summary and click "Submit to SKAT".
   The application is queued (status → `queued`). A submission ID is shown.

### View an application

- Click any application card on the dashboard
- The detail page shows all data, lets you re-validate, and submit if validated

---

## 6. API endpoints (quick reference)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/dev-login` | **[DEV]** Login with email, returns JWT |
| `GET`  | `/api/v1/auth/me` | Current user |
| `GET`  | `/api/v1/organisations?cvr=` | CVR lookup |
| `GET`  | `/api/v1/applications` | List my applications |
| `POST` | `/api/v1/applications` | Create draft application |
| `GET`  | `/api/v1/applications/:id` | Get application |
| `PUT`  | `/api/v1/applications/:id` | Update draft |
| `POST` | `/api/v1/applications/:id/assess` | Run obligation assessment |
| `POST` | `/api/v1/applications/:id/validate` | Validate against ruleset |
| `POST` | `/api/v1/applications/:id/submit` | Submit to SKAT (async, requires `X-Idempotency-Key`) |
| `GET`  | `/api/v1/submissions/:id/status` | Submission status |
| `POST` | `/api/v1/submissions/:id/retry` | Retry a failed submission |
| `POST` | `/api/v1/applications/:id/documents` | Initiate document upload |
| `GET`  | `/api/v1/validation/rulesets` | List validation rulesets |

Full interactive docs: **http://localhost:3000/api/docs**

---

## 7. Environment variables (backend)

See `backend/.env.example`. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://vat:vat@localhost:5432/vatdb` | Postgres connection string |
| `JWT_SECRET` | `change-me-in-production` | JWT signing secret |
| `PORT` | `3000` | Backend port |
| `NODE_ENV` | `development` | Set to `production` to disable dev login |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `BLOB_STORAGE_URL` | (optional) | Blob storage base URL for document uploads |

---

## 8. Project structure

```
VATfolder/
├── backend/               # NestJS API
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── src/
│       ├── common/        # Guards, filters, middleware
│       └── modules/
│           ├── auth/           # JWT auth + dev login
│           ├── applications/   # VAT application CRUD
│           ├── documents/      # Document upload (presigned URLs)
│           ├── validation/     # Ruleset validation engine
│           ├── submissions/    # Async submission to SKAT
│           └── organisations/  # CVR lookup
├── frontend/              # React + TypeScript (Vite)
│   └── src/
│       ├── api/           # Typed API client
│       ├── context/       # Auth state (React context)
│       └── pages/         # Login, Dashboard, Wizard, Detail
├── docs/                  # Architecture, ADRs, design specs
└── api/openapi.yaml       # OpenAPI contract
```
