# Organization Sync Service

This utility service automatically synchronizes the `Organization` table fields (`tin` and `tax_classification`) when the `OrganizationRegistration` table is updated through the PUT/PATCH endpoints.

## Features

1. **Automatic Synchronization**: When `PUT /api/org/organizations/{id}/registration` is called with `tin` or `tax_type` fields, the corresponding fields in the `Organization` table are automatically updated.

2. **Validation Tools**: Provides methods to validate and repair sync inconsistencies between tables.

3. **Debug Logging**: Comprehensive logging for tracking sync operations.

## Implementation

### Files Created

- `src/common/services/organization-sync.service.ts` - Main utility service
- `src/common/services/organization-sync.service.spec.ts` - Unit tests
- `src/modules/organizations/services/organization-sync.service.spec.ts` - Integration tests
- `test/organization-sync.e2e-spec.ts` - End-to-end tests

### Key Methods

#### `syncOrganizationFromRegistration(organizationId, data)`
Synchronizes Organization table fields with registration data:
```typescript
await syncService.syncOrganizationFromRegistration('org-123', {
  tin: '123456789000',
  tax_type: TaxClassification.VAT
});
```

#### `validateOrganizationSync(organizationId)`
Validates consistency between Organization and OrganizationRegistration:
```typescript
const validation = await syncService.validateOrganizationSync('org-123');
console.log(validation.isValid); // true/false
```

#### `repairOrganizationSync(organizationId)`
Repairs inconsistencies by updating Organization to match registration:
```typescript
const result = await syncService.repairOrganizationSync('org-123');
console.log(result.changes); // ['TIN: old → new', 'Tax Classification: VAT → NON_VAT']
```

## Usage Example

When updating organization registration:

```bash
# Before sync
curl -X PUT /api/org/organizations/org-123/registration \
  -H "Content-Type: application/json" \
  -d '{
    "tin": "987654321000",
    "tax_type": "NON_VAT",
    "contact_number": "+639987654321"
  }'
```

**What happens automatically:**
1. `OrganizationRegistration` table is updated with new values
2. `OrganizationSyncService.syncOrganizationFromRegistration()` is called
3. `Organization.tin` is updated to "987654321000"
4. `Organization.tax_classification` is updated to "NON_VAT"

## Database Schema Alignment

### Before Sync Service
```
Organization: { id: "org-123", tin: "123456789000", tax_classification: "VAT" }
OrganizationRegistration: { tin: "987654321000", tax_type: "NON_VAT" }
```

### After Sync Service
```
Organization: { id: "org-123", tin: "987654321000", tax_classification: "NON_VAT" }
OrganizationRegistration: { tin: "987654321000", tax_type: "NON_VAT" }
```

## Testing

All tests pass:
- ✅ Unit tests: Service logic and error handling
- ✅ Integration tests: Service integration with OrganizationService
- ✅ E2E tests: Full API endpoint testing

The service ensures data consistency between the `Organization` and `OrganizationRegistration` tables automatically whenever registration data is updated.