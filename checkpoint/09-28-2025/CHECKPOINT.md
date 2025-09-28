# CHECKPOINT - Step 09-28-2025.STEP2
Date: 2025-09-28
Summary: Integrated RBAC API calls for organization creation - POST /organizations now calls RBAC API's POST /api/resources endpoint
Files changed:
- src/modules/organizations/organizations.module.ts (Added HttpModule import)
- src/modules/organizations/services/organization.service.ts (Added RBAC API call in create method)
- src/modules/organizations/controllers/organization.controller.ts (Extract JWT token and pass to service)
- src/modules/organizations/tests/step9-28-2025.organization-service-rbac.spec.ts (Added unit tests for RBAC integration)
- test/integration.e2e-spec.ts (Added nock mocking for RBAC API calls)
- checkpoint/org-mgmt-api.yaml (Updated OpenAPI spec if needed)
Tests added: Unit tests for RBAC API integration, e2e tests with mocked RBAC calls
Build status: OK
Notes: Organization creation now calls RBAC API to register each organization as a resource. JWT token is extracted from request headers and passed to RBAC API. Service gracefully handles RBAC API failures without failing organization creation. All tests pass.