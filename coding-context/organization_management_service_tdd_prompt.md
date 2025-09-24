# Organization Management Service — TDD Coding Prompt

> **Goal:** Build an Organization Management service that holds canonical organization records, tax obligations, and computed schedules. The service integrates with an external RBAC service (JWT-based) but does not host file upload or OCR. Work _strictly_ using Test Driven Development (TDD).

---

## Global Rules (must follow)
- ✅ Before starting initialize a git repo so you can commit changes and track progress; no need to add a remote repo at this stage.
- ✅ Always follow **Test Driven Development (TDD)**: write failing tests first, then implement code until tests pass.
- ✅ At every step: ensure `npm run build` and `npm test` both succeed.
- ✅ Make sure existing functionalities are not broken.
- ✅ For every step, if acceptance criteria passes, always add and commit using git
- ✅ After each step: update a `CHECKPOINT.md` file summarizing what was done.
- ✅ Always check `.env` for configuration changes. If new config is needed, update both `.env` and `.env.example`.
- ✅ Keep schema backwards-compatible. Do not break existing functionality.
- ✅ Never return sensitive data (passwords, secrets, tokens) in logs or test outputs.
- ✅ Ask the user: **“Step X complete. Proceed?”** before moving to the next step.

---

## Quick Overview / Assumptions
- Use **NestJS (TypeScript)** for the server (preferred); Jest for tests; Prisma + PostgreSQL for DB. You may adapt to Express if required, but keep the folder layout and testing strategy.
- **File upload & OCR are external** — this service receives canonical fields via API (or manual entry) and stores org + obligations data.
- RBAC issues JWTs signed with **HS256**; secret is `JWT_SECRET` in `.env`.
- RBAC JWT payload fields (available in `req.user` after validation):
  - `userId`: string UUID
  - `isSuperAdmin`: boolean
  - `permissions`: string[] (deduplicated array of permission strings OR wildcard `"*"` for super admin)
  - `iat`, `exp`
- Permission string format used in tests and implementation: `resource.action[:orgId|*]` e.g. `organization.read:org-uuid` or `organization.write:*`. RBAC may also return `*`.

---

## Tech Stack (recommended)
- Node.js + TypeScript
- NestJS (or Express if requested)
- Prisma ORM + PostgreSQL
- Jest + Supertest for integration tests
- jsonwebtoken for JWT handling
- dotenv for config
- Optional: nock for mocking RBAC API calls in tests


---

## Environment variables
Update `.env` and `.env.example` whenever a new config is needed.

Minimum required variables:
```
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/orgs_dev
JWT_SECRET=your_jwt_secret_here
RBAC_API_URL=http://rbac-service.local
RBAC_CHECK_REALTIME=false  # if true, the service will call RBAC API to double-check permissions
NODE_ENV=development
```

> **Security note:** Never commit real secrets. `.env.example` should contain placeholders only but create a complete .env file so the application will run in development.

---

## Database Models (summary)
Design the following core tables. Use Prisma migrations — but tests should work without the actual db running.

### organizations
- `id` UUID PK
- `name` TEXT (not null)
- `tin` TEXT (nullable)
- `category` ENUM (`INDIVIDUAL`, `NON_INDIVIDUAL`)
- `subcategory` ENUM (contextual, includes `OTHERS` fallback)
- `tax_classification` ENUM (`VAT`, `NON_VAT`, `WITHHOLDING`, `MIXED`, `OTHERS`)
- `registration_date` DATE (nullable)
- `address` TEXT (nullable)
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP
- `deleted_at` TIMESTAMP (nullable, for soft-delete)

### tax_obligations (master list)
- `id` UUID PK
- `code` TEXT (e.g., `2550M`, `1701`)
- `name` TEXT
- `frequency` ENUM (`MONTHLY`, `QUARTERLY`, `ANNUAL`, `ONE_TIME`)
- `due_rule` JSONB (e.g. `{ "day": 20 }` or more complex rules)
- `active` BOOLEAN
- `created_at`, `updated_at`

### organization_obligations
- `id` UUID PK
- `organization_id` FK -> organizations(id)
- `obligation_id` FK -> tax_obligations(id)
- `start_date` DATE
- `end_date` DATE (nullable)
- `status` ENUM (`ACTIVE`, `INACTIVE`, `EXEMPT`)
- `notes` TEXT
- `created_at`, `updated_at`

### obligation_schedules (optional, recommended)
- `id` UUID PK
- `org_obligation_id` FK -> organization_obligations(id)
- `period` TEXT (e.g., `2025-09` or `Q3-2025`)
- `due_date` DATE
- `status` ENUM (`DUE`, `FILED`, `LATE`, `EXEMPT`)
- `filed_at` DATE (nullable)
- `created_at`, `updated_at`

> Keep the models normalized. Store canonical org fields only in `organizations`. No document blobs.

---

## Testing Strategy — what to test (TDD-first)

### Principles
- **Unit tests never hit the real database.**
  - Use **repository mocks** that simulate Prisma/Postgres behavior.
  - Mock responses must follow the schema definitions from the `organizations`, `tax_obligations`, `organization_obligations`, and `obligation_schedules` tables.
  - Example: a `createOrganization()` test should mock `organizationRepository.create` to return an object shaped exactly like the DB schema row.
- **Integration tests** (placed in global `test/` folder) may spin up an in-memory Postgres substitute (e.g., `pg-mem`) or mocked layer, but not the actual DB.
- Keep mocks consistent across tests by using reusable factories (e.g., `test/factories/organization.factory.ts`).
- Always test with valid, invalid, and edge-case inputs.
- Validate JWT permission checks with mocked `req.user` objects.
- Where RBAC API calls are required, use **nock** or similar HTTP mock library.

### Unit Tests (per module)
- **Organizations**
  - `createOrganization` (valid payload, missing fields, invalid enums)
  - `updateOrganization` (existing vs. not found)
  - `getOrganizationById` (found vs. not found)
  - `listOrganizations` (pagination, filters)
  - `softDeleteOrganization`
- **Tax Obligations**
  - `createTaxObligation`
  - `listActiveObligations`
  - Validation of `due_rule` JSON shape
- **Organization Obligations**
  - `assignObligationToOrg` (valid org + obligation)
  - `removeObligationFromOrg`
  - Prevent duplicates
- **Schedules**
  - `generateSchedulesForOrg` (mock due dates)
  - `markScheduleAsFiled`

### Integration Tests (service-level, still mocked DB)
- Auth Guard rejects requests with invalid/expired JWT
- Permissions Guard allows/disallows based on `permissions[]` or `isSuperAdmin`
- Endpoints return correct HTTP status codes and JSON bodies
- End-to-end happy-path: Create Organization → Assign Obligation → Generate Schedule → Mark Filed

### Factories for Mock Data
Each test should use factories that return objects shaped like:
- **Organization**:
```ts
{
  id: "uuid",
  name: "ACME Corp",
  tin: "123456789",
  category: "NON_INDIVIDUAL",
  subcategory: "CORPORATION",
  tax_classification: "VAT",
  registration_date: new Date(),
  address: "Makati City",
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null
}
```
- **Tax Obligation**:
```ts
{
  id: "uuid",
  code: "2550M",
  name: "Monthly VAT",
  frequency: "MONTHLY",
  due_rule: { day: 20 },
  active: true,
  created_at: new Date(),
  updated_at: new Date()
}
```

---

## Step-by-step TDD Plan
The plan uses numbered steps. After you finish each step, update `CHECKPOINT.md` and then ask: **“Step X complete. Proceed?”** — wait for the user to confirm before continuing.

> **Naming convention:** Prefix tests with `stepX.` in filenames for clarity (e.g., `step1.organizations.spec.ts`).

### Step 0 — Repo scaffold & baseline tests
**Goal:** Initialize the repo, add build/test scripts, create basic CI check locally.

**Failing tests to write first:**
- `healthcheck.spec.ts` — test that `GET /health` returns `200 { status: 'ok' }`.
- `env.spec.ts` — test the app fails to start if `JWT_SECRET` or `DATABASE_URL` is missing.

**Implementation tasks:**
- Initialize a NestJS project (or Express) with TypeScript.
- Add `package.json` scripts:
  - `build` → `tsc` or `nest build`
  - `start` → `node dist/main.js`
  - `test` → `jest`
  - `test:watch` → `jest --watch`
  - `migrate` → `prisma migrate deploy`
  - `prisma:generate`
- Create `.env` and `.env.example` (placeholders only).
- Minimal `/health` route and app bootstrap.

## Recommended Folder Structure (Clean & Modular)
Follow a modular, feature-based structure for maintainability and testability:

```
src/
 ├── main.ts                 # App entrypoint
 ├── app.module.ts           # Root module
 ├── common/                 # Shared helpers & utilities
 │    ├── constants/         # Enum & global constants
 │    ├── decorators/        # Custom decorators
 │    ├── exceptions/        # Custom error classes
 │    ├── filters/           # Exception filters
 │    ├── guards/            # Auth & permission guards
 │    ├── interceptors/      # Logging, transform, etc.
 │    └── utils/             # Helper functions
 │
 ├── config/                 # Config modules (.env mapping)
 │    ├── app.config.ts
 │    ├── db.config.ts
 │    └── auth.config.ts
 │
 ├── database/               # Prisma and migration handling
 │    ├── prisma.service.ts
 │    ├── migrations/
 │    └── seed.ts
 │
 ├── modules/                # Feature-based modules
 │    ├── organizations/     # Organization management
 │    │    ├── dto/          # DTOs & validation schemas
 │    │    ├── entities/     # ORM entity definitions
 │    │    ├── controllers/  # REST controllers
 │    │    ├── services/     # Business logic
 │    │    ├── repositories/ # Database logic
 │    │    └── tests/        # Unit & integration tests
 │    │
 │    ├── obligations/       # Tax obligations
 │    │    ├── dto/
 │    │    ├── entities/
 │    │    ├── controllers/
 │    │    ├── services/
 │    │    ├── repositories/
 │    │    └── tests/
 │    │
 │    ├── schedules/         # Obligation schedule generator
 │    │    ├── dto/
 │    │    ├── entities/
 │    │    ├── controllers/
 │    │    ├── services/
 │    │    └── tests/
 │
 └── auth/                   # Auth & RBAC integration
      ├── jwt.strategy.ts
      ├── permissions.guard.ts
      ├── rbac.service.ts
      └── tests/
```

### Best Practices
- Keep **controllers thin**: delegate logic to services.
- Keep **services focused**: one responsibility each.
- Use **repositories** as abstraction over Prisma to allow mocking in tests.
- Tests should mirror the structure (unit tests inside each module, e2e tests in `test/`).
- Maintain a global `test/` folder for e2e integration.
- Shared code (decorators, guards, utils) always goes under `common/`.
- Each module should be independently testable.

---
  - `test/`: E2E and integration tests.
  - `scripts/`: Helper scripts.

**Acceptance:** 
- Specific test file succeeds.
- `npm run build` and `npm test` succeed.
- No linting errors
- No typscript errors

**After finishing:** Update `CHECKPOINT.md` with what was scaffolded.

---

### Step 1 — Organizations model + repository (DB-level)
**Goal:** Add `organizations` table and repository layer. Ensure the repository passes tests.

**Failing tests to write first:**
- `organization-repo.spec.ts`
  - `createOrganization` should fail when required fields missing.
  - `createOrganization` should create a record and return the new org with `id` and timestamps.
  - `getOrganizationById` should return `null` for non-existing id.
  - `listOrganizations` supports filters `category`, `tax_classification`.

**Implementation tasks:**
- Add Prisma schema for `Organization` and migrate.
- Implement repository (or PrismaService) with methods: `create`, `getById`, `update`, `softDelete`, `list(filters)`.

**Acceptance:** tests pass; run `npm run build` & `npm test`.

**After finishing:** Update `CHECKPOINT.md` with DB schema and repository notes.

---

### Step 2 — Organizations CRUD API endpoints
**Goal:** Implement REST endpoints for organizations with input validation and soft-delete.

**Failing tests to write first (integration using Supertest):**
- `organizations.controller.spec.ts`
  - `POST /organizations` returns `201` and created payload when valid input & authorized user.
  - `GET /organizations/:id` returns `200` with org data when authorized, `403` otherwise.
  - `PUT /organizations/:id` updates allowed fields; forbidden for unauthorized users.
  - `DELETE /organizations/:id` sets `deleted_at` and returns `204`.
  - `GET /organizations` supports pagination and filters.

**Auth-focused tests to write for this step (fail-first):**
- `POST /organizations` without JWT -> `401`.
- `POST /organizations` with JWT but lacking permission -> `403`.

**Implementation tasks:**
- Implement controllers, DTOs, validators (class-validator).
- Add soft-delete logic.
- Implement permission guard that decodes the JWT and checks claims.

**Acceptance:** All integration tests pass; build & test succeed.

**After finishing:** Update `CHECKPOINT.md` and list sample API calls.

---

### Step 2.5 - Context for Steps 3, 4, and 5
- Use the file categories_and_subcategories.md as context in the next steps.
- If you have any questions or clarifications, ask for user input or confirmation.

--- 

### Step 3 — Tax obligations master
**Goal:** Implement `tax_obligations` master CRUD (admin only).

**Failing tests to write first:**
- `tax-obligations.spec.ts`
  - Admin user can `POST /tax-obligations` to create a new obligation.
  - Non-admin users receive `403` for create/update/delete.
  - `GET /tax-obligations` returns active obligations by default.

**Implementation tasks:**
- Add Prisma model and migrations for `tax_obligations`.
- Implement endpoints, admin-permission guard.

**Acceptance:** tests and build pass.

**After finishing:** Update `CHECKPOINT.md`.

---

### Step 4 — Organization obligations (assignment + status)
**Goal:** Allow assigning obligations to organizations and manage their status.

**Failing tests to write first:**
- `org-obligations.spec.ts`
  - `POST /organizations/:id/obligations` assigns an obligation (admin or org-admin only).
  - `GET /organizations/:id/obligations` lists assigned obligations.
  - `PUT /organization-obligations/:id` updates status (e.g., `EXEMPT`).

**Implementation tasks:**
- Add Prisma model and endpoints.
- Implement business rules (start/end date validation).

**Acceptance:** tests & build pass.

**After finishing:** Update `CHECKPOINT.md`.

---

### Step 5 — Obligation schedule generator (compute due dates)
**Goal:** Provide endpoint to compute upcoming due dates for an organization's obligations.

**Failing tests to write first (unit + integration):**
- `schedule-generator.spec.ts` (unit)
  - Given an obligation with `{ frequency: MONTHLY, due_rule: { day: 20 } }` and a range `from=2025-09-01,to=2025-12-31`, `generateSchedules` returns expected periods and due dates.
- `org-schedules.spec.ts` (integration)
  - `GET /organizations/:id/schedules?from=...&to=...` returns computed schedule entries.

**Implementation tasks:**
- Implement pure utility `generateSchedules(obligation, startDate, endDate)` with unit tests.
- Wire into controller endpoint.

**Acceptance:** tests & build pass.

**After finishing:** Update `CHECKPOINT.md`.

---

### Step 6 — Auth & RBAC verification
**Context:** 
- There is an existing RBAC API that issues permissions to users, read RESOURCE_ACCESS_FLOW.md to understand how we can check if a user has permission to access the organization
- Check the ORGANIZATION_PERMSSION_MAPPING.md to check the permission mapping used by the existing RBAC API

**Goal:** Implement JWT verification + permission guard. Support both local-claim checks and RBAC API double-check.

**Failing tests to write first:**
- `auth.spec.ts`
  - Valid JWT signed with `JWT_SECRET` allows request when correct permissions present.
  - Expired JWT returns `401`.
  - JWT without required permission returns `403`.
  - When `isSuperAdmin: true` or `permissions: ['*']` allow all actions.
  
**Implementation tasks:**
- Add `AuthGuard` that uses `jsonwebtoken` and `JWT_SECRET` to verify tokens (HS256). Check the jwt_from_rbac_api.txt as reference on what JWT is being issued by the RBAC API to the client.
- Implement `PermissionsGuard` that validates required permission for an endpoint.
- Add decorator `@RequiresPermission('organization.read')` to controllers to express required permission. Permission checks should accept org-scoped permissions (e.g., `organization.read:orgId`) or wildcard `*`.
- Call the RBAC API to confirm permission on sensitive operations. Mock RBAC calls in tests.
- Update the existing test for accessing organization (Step 2 CRUD endpoints) to consider the permissions needed then make the tests pass by updating necessary implementations. (Test-Driven-Development)

**Acceptance:** tests & build pass.

**After finishing:** Update `CHECKPOINT.md`.

---

### Step 6.5  - Organization Status

**Goal: ** Track the status of an organization in a different table and return the status together in the response of endpoints that get organization details.

**Failing tests to write first:**
- step6.5.organization-status.spec.ts
  - CRUD tests for organization status
  - Only user with correct read permission can get organization-status
  - Existing endpoints should return organization status

**Implementation tasks**
- create a new table in the schema.prisma
- regenerate the schema with the new table
- when a new organization is created, organization status is atuomatically created, with default status pending
- Organization status details should have but are not limited to:
   > organization_id
   > status
   > last_update
- integrate the organization status to the existing organization CRUD endpoints


**Acceptance:** tests & build pass. Edge cases considered. Complete code coverage.

**After finishing:** Update `CHECKPOINT.md`.


---

### Step 6.6  - Organization Business Operations

**Goal:** Track the organization operations data of an organization in a different table to be able to use it in tax obligation scheduling in the future.

**Failing tests to write first:**
- step6.6.organization-operation.spec.ts
  - CRUD tests for organization operation
  - Only user with correct read permission and update permission can get organization operation data

**Implementation tasks**
- create a new table in the schema.prisma
- regenerate the schema with the new table
- when a new organization is created, organization operation is atuomatically created
- Organization operation details should have but are not limited to:
   > organization_id
   > fy_start - date
   > fy_end  - date
   > vat_reg_effectivity - date
   > registration_effectivity - date
   > payroll_cut_off - string array of mm/dd nullable
   > payment_cut_off - string array of mm/dd nullable
   > quarter_closing - string array of mm/dd nullable
   > has_foreign - boolean default false
   > accounting_method  string (cash, accrual, other) nullable
   > last_update

**Acceptance:** tests & build pass. Edge cases considered. Complete code coverage.

**After finishing:** Update `CHECKPOINT.md`.

---

### Step 7 — Integration Tests: full flows
**Goal:** End-to-end tests covering typical flows (create org from OCR payload, assign obligations, compute schedules).

**Failing tests to write first:**
- `e2e.spec.ts`
  - Create org with token that has `organization.create:*` permission.
  - Assign a VAT obligation and verify `GET /organizations/:id/schedules` returns monthly due dates.
  - Simulate a user without permission trying to update obligations => `403`.

**Implementation tasks:**
- Create e2e test setup that runs migrations and seeds minimal data.
- Use distinct test DB or schema per CI job.

**Acceptance:** e2e tests pass locally and in CI.

**After finishing:** Update `CHECKPOINT.md`.

---

### Step 8 — CI, linting, docs, and OpenAPI
**Goal:** Add GitHub Actions (or equivalent) to run `npm run build` and `npm test` on PRs; generate OpenAPI docs.

**Failing tests to write first:**
- No functional tests: ensure CI workflow runs `build` and `test` steps. (Write a simple `ci.spec.ts` file that asserts environment variables exist when running in CI.)

**Implementation tasks:**
- Add `lint` and `format` scripts.
- Add GitHub Actions file that runs `npm ci`, `npm run build`, `npm test`.
- Generate OpenAPI (Swagger) for controllers.

**Acceptance:** CI passes on PR.

**After finishing:** Update `CHECKPOINT.md`.

---

### Step 9 — Finalize deliverables & sample tokens
**Goal:** Add development helpers and documentation.

**Failing tests to write first:**
- `tokens.spec.ts` ensures helper that produces sample JWTs for dev/testing signs using `JWT_SECRET` and includes expected claims. (Do not print secrets in outputs.)

**Implementation tasks:**
- Add `scripts/generate-dev-token.ts` (excluded from production) that reads `JWT_SECRET` from `.env` and prints a sample token (make sure it is not committed or printed to shared logs).
- Create `README.md` with steps to run tests, run migrations, and spin up the service.

**Acceptance:** `npm run build` & `npm test` pass; README updated.

**After finishing:** Update `CHECKPOINT.md` with final summary.

---

## Conventions & Helper Notes
- Follow consistent API routes: `/organizations`, `/tax-obligations`, `/organizations/:id/obligations`, `/organizations/:id/schedules`.
- Use DTOs + validation for all inputs (class-validator / class-transformer).
- Soft-delete: never hard-delete organizations.
- Confidence thresholds, OCR payloads, and file references are handled by other services — you only accept structured payloads.
- Document all new `.env` entries in `.env.example`.
- Never log full JWT tokens or secrets. For debug logs, log only `userId` and permission names (no token string).

---

## CHECKPOINT.md template (create at repo root)
Create or append to `CHECKPOINT.md` after each step with this structure:

```
# CHECKPOINT - Step X
Date: YYYY-MM-DD
Summary: Short summary of what was done
Files changed: list of main files
Tests added: list of test files
Build status: OK / FAIL
Notes: any important notes, migrations to run, .env changes
```

---

## Example Test Snippets
Below are short examples to include as failing tests (adapt to your test framework).

**Example: JWT unit test (fail-first)**
```ts
// step6.auth.spec.ts
import jwt from 'jsonwebtoken';
import { signPayload } from '../test-utils/token';

it('should reject expired JWT', async () => {
  const token = jwt.sign({ userId: 'u1', iat: Math.floor(Date.now()/1000) - 3600, exp: Math.floor(Date.now()/1000) - 10, permissions: [] }, process.env.JWT_SECRET);
  const res = await request(app.getHttpServer()).get('/organizations').set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(401);
});
```

**Example: organization create (integration failing test first)**
```ts
// step2.organizations.controller.spec.ts
it('returns 401 without JWT', async () => {
  const res = await request(app.getHttpServer()).post('/organizations').send({ name: 'Acme Co', category: 'NON_INDIVIDUAL' });
  expect(res.status).toBe(401);
});

it('creates organization with proper permission', async () => {
  const token = signPayload({ userId: 'u1', permissions: ['organization.create:*'], iat: ..., exp: ... }, process.env.JWT_SECRET);
  const res = await request(app.getHttpServer()).post('/organizations').set('Authorization', `Bearer ${token}`).send({ name: 'Acme Co', category: 'NON_INDIVIDUAL' });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
});
```

---

## Deliverable
- A repository scaffold following the steps above.
- `Organization-Management-Service-TDD-Prompt.md` (this doc) — keep in repo root.
- `CHECKPOINT.md` to be updated after each step.
- Tests prefixed by step number.

---

When you are ready, I can **start Step 0 (initialize repo & baseline tests)** and follow the TDD plan interactively.  

*Do you want me to start with Step 0 now?*  
(If you prefer, I can instead export this document as a `.md` file for download.)

