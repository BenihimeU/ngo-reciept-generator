# NGO Receipt Generator

React frontend and Node.js API for NGO administrators to create and print donation receipts. PostgreSQL stores organisations, admins, sessions, and receipts. The app's receipt is **not** the Income Tax Department's Form 10BE.

## Why PostgreSQL

Receipts need durable records, unique numbers, exact monetary values, and clear links to the organisation and admin who created them. PostgreSQL supports these constraints and transactions directly. For Cloud Run, use **Cloud SQL for PostgreSQL** with automated backups. SQLite can work for a single local machine, but it is a poor fit for multiple stateless Cloud Run instances and shared concurrent writes. A document database adds little value to this relational data.

## Local setup

Requirements: Node.js 20+, npm, and PostgreSQL 15+ (or Docker).

```bash
docker compose up -d db
export DATABASE_URL='postgres://ngo:ngo_local_only@localhost:5432/ngo_receipts'
npm install
npm run db:migrate
```

In separate terminals, with the same `DATABASE_URL` set for the API terminal:

```bash
npm run dev:api
npm run dev
```

Open the Vite URL shown in the terminal and select **New NGO? Create an account**. Enter the NGO name, admin email, and a password of at least 12 characters. After registration, fill in the organisation's PAN, address, 80G URN, and URN issue date before creating receipts. The Vite server proxies `/api` calls to `localhost:8080`.

If you prefer to create an admin from the command line instead, run this after migration:

```bash
export ADMIN_EMAIL='admin@example.org'
export ADMIN_PASSWORD='replace-with-a-long-unique-password'
npm run db:create-admin
```

The API listens on port `8080` unless `PORT` is set.

## Database structure

Schema: [`server/db/schema.sql`](server/db/schema.sql). The migration command applies it idempotently.

| Table | Purpose |
| --- | --- |
| `organisations` | NGO identity, PAN, 80G URN, signatory, and next receipt counter |
| `admins` | Admin email and scrypt password hash, linked to an organisation |
| `sessions` | Hashed session token and expiry; browser receives an HttpOnly cookie |
| `receipts` | Donor and donation data, exact decimal amount, unique receipt number per NGO, and an immutable snapshot of NGO details at issue time |

Receipt creation uses a database transaction and row lock to allocate a number safely when two admins create receipts at once. PostgreSQL enforces the final uniqueness constraint. Issued receipts are not editable through the API.

## Deployment

`npm run build` creates the frontend in `dist/`. The included `Dockerfile` runs the API and serves that build from the same origin, which is the recommended Cloud Run setup. Set `DATABASE_URL` and `APP_ORIGIN` (the public HTTPS URL) as service configuration, preferably delivering the database password through Secret Manager. Run `npm run db:migrate` from a trusted administration environment before first use. Configure Cloud SQL connectivity for Cloud Run, backups, and a small connection pool. The API accepts `DB_POOL_MAX` (default `5`). Before opening public registration on the internet, add email verification and abuse controls.

The GitHub Pages workflow still publishes the static frontend. **GitHub Pages cannot run this API or database.** The login will only work when the frontend can reach a deployed API; for the current cookie setup, serve frontend and API from the same origin as in the Cloud Run container. Do not use the Pages build for real donor data by itself.

## Project layout

- `src/features/`: auth, dashboard, organisation, and receipt screens
- `src/api/client.js`: frontend API requests
- `src/components/`, `src/layout/`, `src/data/`, `src/utils/`: shared UI and helpers
- `server/index.js`: HTTP API and static app serving
- `server/auth.js`: password hashing and database-backed sessions
- `server/db/schema.sql`: relational schema
- `server/scripts/`: migration and initial admin commands

## Tax document boundary

The printed document is a regular donation receipt. For eligible organisations, Form 10BD must be filed and the official Form 10BE issued through the Income Tax portal where applicable. Verify the organisation's approval and current rules before issuing tax statements.

- [Income Tax Department Form 10BE specimen](https://incometaxindia.gov.in/forms/income-tax%20rules/103520000000080976.pdf)
- [Income Tax Department Form 10BD/10BE guide](https://www.incometax.gov.in/iec/foportal/help/statutory-forms/popular-form/form10bd-10be)
