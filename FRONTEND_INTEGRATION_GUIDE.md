# Organization Management API - Frontend Integration Guide

This guide provides comprehensive documentation for frontend applications integrating with the Organization Management API. The API provides full access to organization management, tax obligations, compliance schedules, and business operations.

## 📋 API Documentation

### OpenAPI Specification
A complete OpenAPI 3.0 YAML specification is available at:
```
checkpoint/org-mgmt-api.yaml
```

This specification includes:
- All API endpoints with detailed request/response schemas
- Authentication requirements (JWT Bearer tokens)
- Complete data models and enums
- Error response definitions
- Interactive examples for testing

### Swagger UI Documentation
Interactive API documentation is available via Swagger UI at:
```
http://localhost:3000/docs
```

## 🔐 Authentication

All API endpoints require JWT authentication with Bearer token authorization. The API uses role-based access control (RBAC) with the following permission structure:

### JWT Token Structure
```json
{
  "sub": "user-id",
  "username": "superadmin",
  "permissions": [
    "resource:create",
    "resource:read",
    "resource:update",
    "resource:delete",
    "tax:configure",
    "*"
  ]
}
```

### Authorization Header
```
Authorization: Bearer <jwt_token>
```

### Permission Levels
- `resource:create` - Create organizations and assign obligations
- `resource:read` - Read organizations, obligations, and schedules
- `resource:update` - Update organization details and obligation status
- `resource:delete` - Soft delete organizations
- `tax:configure` - Create and manage tax obligations
- `*` - Wildcard permission for full access (superadmin)

## 🌐 API Base URL
```
http://localhost:3000/api/org
```

## � Data Transfer Objects (DTOs)

The API uses comprehensive DTOs for request validation and response formatting. All DTOs include proper validation decorators and TypeScript types.

### Organization DTOs

#### CreateOrganizationRequestDto
Used for creating new organizations with complete registration details.

**Required Fields:**
- `name`: Organization name (string)
- `category`: `INDIVIDUAL` or `NON_INDIVIDUAL` (enum)
- `tax_classification`: `VAT` or `NON_VAT` (enum)
- `first_name`: Registrant first name (string)
- `last_name`: Registrant last name (string)
- `line_of_business`: PSIC code (string)
- `address_line`: Address line (string)
- `region`: Region (string)
- `city`: City (string)
- `zip_code`: ZIP code (string)
- `tin_registration`: 12-digit TIN (string, validated)
- `rdo_code`: RDO code (string)
- `contact_number`: Contact number (string)
- `email_address`: Email address (string, validated)
- `tax_type`: Tax type enum (enum)
- `start_date`: Start date (Date)
- `reg_date`: Registration date (Date)

**Optional Fields:**
- `tin`: Tax identification number (string)
- `subcategory`: Organization subcategory (enum)
- `registration_date`: Registration date (Date)
- `address`: Organization address (string)
- `middle_name`: Registrant middle name (string)
- `trade_name`: Trade name (string)

#### UpdateOrganizationRequestDto
Used for updating existing organizations (all fields optional).

**Fields:**
- `name`: Organization name (string)
- `tin`: Tax identification number (string)
- `category`: Organization category (enum)
- `subcategory`: Organization subcategory (enum)
- `tax_classification`: Tax classification (enum)
- `registration_date`: Registration date (Date)
- `address`: Organization address (string)

#### UpdateOrganizationOperationRequestDto
Used for updating fiscal year and operational settings.

**Fields:**
- `fy_start`: Fiscal year start date (Date)
- `fy_end`: Fiscal year end date (Date)
- `vat_reg_effectivity`: VAT registration effectivity (Date)
- `registration_effectivity`: Registration effectivity (Date)
- `payroll_cut_off`: Payroll cut-off dates (string[])
- `payment_cut_off`: Payment cut-off dates (string[])
- `quarter_closing`: Quarter closing dates (string[])
- `has_foreign`: Has foreign transactions (boolean)
- `has_employees`: Has employees (boolean)
- `is_ewt`: Is expanded withholding tax (boolean)
- `is_fwt`: Is final withholding tax (boolean)
- `is_bir_withholding_agent`: Is BIR withholding agent (boolean)
- `accounting_method`: Accounting method (enum: ACCRUAL, CASH, OTHERS)

#### UpdateOrganizationStatusRequestDto
Used for updating organization business status.

**Required Fields:**
- `status`: Business status (enum)
- `reason`: Status change reason (enum)

**Optional Fields:**
- `description`: Status change description (string)

**Status Options:**
- `REGISTERED`, `PENDING_REG`, `ACTIVE`, `INACTIVE`, `CESSATION`, `CLOSED`, `NON_COMPLIANT`, `UNDER_AUDIT`, `SUSPENDED`

**Reason Options:**
- `EXPIRED`, `OPTED_OUT`, `PAYMENT_PENDING`, `VIOLATIONS`

#### UpdateOrganizationRegistrationRequestDto
Used for updating BIR registration information (all fields optional).

**Fields:**
- `first_name`, `middle_name`, `last_name`: Registrant names (string)
- `trade_name`: Trade name (string)
- `line_of_business`: PSIC code (string)
- `address_line`, `region`, `city`, `zip_code`: Address details (string)
- `tin`, `rdo_code`: BIR registration details (string)
- `contact_number`: Contact number (string)
- `email_address`: Email address (string)
- `tax_type`: Tax type (enum)
- `start_date`, `reg_date`: Important dates (Date)

### Tax Obligation DTOs

#### CreateTaxObligationRequestDto
Used for creating new tax obligation definitions.

**Required Fields:**
- `code`: Tax obligation code (string)
- `name`: Tax obligation name (string)
- `frequency`: Filing frequency (enum: MONTHLY, QUARTERLY, ANNUAL, ONE_TIME)
- `due_rule`: Due date rules configuration (JSON object)

**Optional Fields:**
- `status`: Tax obligation status (enum)

#### TaxObligationResponseDto
Response format for tax obligation data.

**Fields:**
- `id`: Unique identifier (string)
- `code`: Tax obligation code (string)
- `name`: Tax obligation name (string)
- `frequency`: Filing frequency (enum)
- `due_rule`: Due date rules (object)
- `status`: Tax obligation status (enum)
- `created_at`, `updated_at`: Timestamps (Date)

### Organization Obligation DTOs

#### AssignObligationRequestDto
Used for assigning tax obligations to organizations.

**Required Fields:**
- `obligation_id`: Tax obligation ID (string)
- `start_date`: Obligation start date (string, date format)

**Optional Fields:**
- `end_date`: Obligation end date (string, date format)
- `notes`: Assignment notes (string)

#### UpdateObligationStatusRequestDto
Used for updating obligation status.

**Required Fields:**
- `status`: New obligation status (enum)

**Status Options:**
- `NOT_APPLICABLE`, `ASSIGNED`, `ACTIVE`, `DUE`, `FILED`, `PAID`, `OVERDUE`, `LATE`, `EXEMPT`, `SUSPENDED`, `CLOSED`

#### OrganizationObligationResponseDto
Response format for organization obligation data.

**Fields:**
- `id`: Unique identifier (string)
- `organization_id`: Organization ID (string)
- `obligation_id`: Tax obligation ID (string)
- `start_date`, `end_date`: Obligation period (Date)
- `status`: Obligation status (enum)
- `notes`: Notes (string)
- `created_at`, `updated_at`: Timestamps (Date)

### Organization Owner DTOs

#### AssignOrganizationOwnerRequestDto
Used for assigning organization owners.

**Required Fields:**
- `org_id`: Organization ID (string, UUID validated)
- `user_id`: User ID (string)

#### OrganizationOwnerResponseDto
Response format for owner assignment data.

**Fields:**
- `id`: Assignment ID (string)
- `org_id`: Organization ID (string)
- `user_id`: User ID (string)
- `assigned_date`: Assignment date (Date)
- `last_update`: Last update timestamp (Date)

#### CheckOwnershipResponseDto
Response format for ownership checks.

**Fields:**
- `is_owner`: Ownership status (boolean)
- `org_id`: Organization ID (string)
- `user_id`: User ID (string)

### Schedule DTOs

#### GetSchedulesQueryDto
Query parameters for schedule retrieval.

**Optional Fields:**
- `start_date`: Start date for schedule generation (string, date)
- `end_date`: End date for schedule generation (string, date)

#### ScheduleResponseDto
Response format for compliance schedule data.

**Fields:**
- `org_obligation_id`: Organization obligation ID (string)
- `period`: Reporting period (string)
- `due_date`: Due date (Date)
- `status`: Filing status (enum: DUE, FILED, LATE, EXEMPT)
- `filed_at`: Filed date (Date, nullable)

## �📡 API Endpoint Structure

The API provides the following main endpoint categories:

### Core Endpoints
- **Health Check**: `GET /health` (excluded from global prefix)
- **Organizations**: `GET|POST /organizations`, `GET|PUT|DELETE /organizations/{id}`
- **Organization Operations**: `GET|PUT /organizations/{id}/operation`
- **Organization Status**: `GET|PUT|PATCH /organizations/{id}/status`
- **Organization Registration**: `GET|PUT|PATCH /organizations/{id}/registration`

### Tax Management
- **Tax Obligations**: `GET|POST /tax-obligations`
- **Organization Obligations**: `GET /organizations/{orgId}/obligations`, `POST /organizations/{orgId}/obligations`, `PUT /organization-obligations/{id}`

### Compliance
- **Schedules**: `GET /organizations/{id}/schedules`

### Organization Ownership
- **Organization Owners**: `GET|POST /organizations/{orgId}/owners`, `DELETE /organizations/{orgId}/owners/{userId}`, `DELETE /organization-owners/{id}`
- **Ownership Check**: `GET /organizations/{orgId}/ownership`

## 1. View All Organizations

Retrieve a list of all organizations with optional filtering.

### Endpoint
```
GET /organizations
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Query Parameters (Optional)
- `category`: Filter by organization category (`INDIVIDUAL` or `NON_INDIVIDUAL`)
- `tax_classification`: Filter by tax classification (`VAT` or `NON_VAT`)
- `subcategory`: Filter by subcategory (`SELF_EMPLOYED`, `SOLE_PROPRIETOR`, `FREELANCER`, `CORPORATION`, `PARTNERSHIP`, `OTHERS`)

### Example Request
```javascript
// View all organizations
const response = await fetch('http://localhost:3000/api/org/organizations', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});

const organizations = await response.json();
```

### Example Response
```json
[
  {
    "id": "org-123",
    "name": "ABC Corporation",
    "tin": "001234567890",
    "category": "NON_INDIVIDUAL",
    "subcategory": "CORPORATION",
    "tax_classification": "VAT",
    "registration_date": "2024-01-01T00:00:00.000Z",
    "address": "Makati City, Philippines",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": null,
    "status": {
      "id": "status-123",
      "organization_id": "org-123",
      "status": "PENDING",
      "last_update": "2024-01-01T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
]
```

### Frontend Implementation Example
```javascript
// React component to display organizations
function OrganizationsList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchOrganizations();
  }, [filters]);

  const fetchOrganizations = async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/org/organizations?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${getJwtToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>All Organizations</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Tax Classification</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map(org => (
              <tr key={org.id}>
                <td>{org.name}</td>
                <td>{org.category}</td>
                <td>{org.tax_classification}</td>
                <td>{org.status?.status || 'N/A'}</td>
                <td>
                  <button onClick={() => viewOrganization(org.id)}>
                    View
                  </button>
                  <button onClick={() => editOrganization(org.id)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## 2. Create New Organization

Create a new organization with all required and optional fields.

### Endpoint
```
POST /organizations
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "name": "XYZ Corporation Ltd",
  "tin": "001234567890",
  "category": "NON_INDIVIDUAL",
  "subcategory": "CORPORATION",
  "tax_classification": "VAT",
  "registration_date": "2024-01-01",
  "address": "123 Main Street, Makati City, Philippines",
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "trade_name": "XYZ Trading",
  "line_of_business": "6201",
  "address_line": "123 Main Street",
  "region": "NCR",
  "city": "Makati",
  "zip_code": "1223",
  "tin_registration": "001234567890",
  "rdo_code": "001",
  "contact_number": "+639123456789",
  "email_address": "john.doe@example.com",
  "tax_type": "VAT",
  "start_date": "2024-01-01",
  "reg_date": "2024-01-01"
}
```

### Field Descriptions
- `name` (required): Organization name
- `tin` (optional): Tax Identification Number
- `category` (required): `INDIVIDUAL` or `NON_INDIVIDUAL`
- `subcategory` (optional): Organization type
- `tax_classification` (required): `VAT` or `NON_VAT`
- `registration_date` (optional): Registration date (YYYY-MM-DD)
- `address` (optional): Organization address
- **Registration Fields** (all required for creation):
  - `first_name`, `last_name`: Registrant name
  - `line_of_business`: PSIC code
  - `address_line`, `region`, `city`, `zip_code`: Address details
  - `tin_registration`, `rdo_code`: BIR registration details
  - `contact_number`, `email_address`: Contact information
  - `tax_type`, `start_date`, `reg_date`: Tax registration details

### Example Request
```javascript
const createOrganization = async (orgData) => {
  try {
    const response = await fetch('http://localhost:3000/api/org/organizations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orgData)
    });

    if (response.ok) {
      const newOrg = await response.json();
      console.log('Organization created:', newOrg);
      return newOrg;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to create organization:', error);
    throw error;
  }
};
```

### Frontend Implementation Example
```javascript
// React form component for creating organizations
function CreateOrganizationForm() {
  const [formData, setFormData] = useState({
    name: '',
    tin: '',
    category: 'NON_INDIVIDUAL',
    subcategory: 'CORPORATION',
    tax_classification: 'VAT',
    registration_date: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/org/organizations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getJwtToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newOrg = await response.json();
        alert('Organization created successfully!');
        // Reset form or redirect
        setFormData({
          name: '',
          tin: '',
          category: 'NON_INDIVIDUAL',
          subcategory: 'CORPORATION',
          tax_classification: 'VAT',
          registration_date: '',
          address: ''
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Organization</h2>

      <div>
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div>
        <label>TIN:</label>
        <input
          type="text"
          value={formData.tin}
          onChange={(e) => setFormData({...formData, tin: e.target.value})}
        />
      </div>

      <div>
        <label>Category:</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
        >
          <option value="INDIVIDUAL">Individual</option>
          <option value="NON_INDIVIDUAL">Non-Individual</option>
        </select>
      </div>

      <div>
        <label>Subcategory:</label>
        <select
          value={formData.subcategory}
          onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
        >
          <option value="SELF_EMPLOYED">Self Employed</option>
          <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
          <option value="FREELANCER">Freelancer</option>
          <option value="CORPORATION">Corporation</option>
          <option value="PARTNERSHIP">Partnership</option>
          <option value="OTHERS">Others</option>
        </select>
      </div>

      <div>
        <label>Tax Classification:</label>
        <select
          value={formData.tax_classification}
          onChange={(e) => setFormData({...formData, tax_classification: e.target.value})}
          required
        >
          <option value="VAT">VAT</option>
          <option value="NON_VAT">Non-VAT</option>
        </select>
      </div>

      <div>
        <label>Registration Date:</label>
        <input
          type="date"
          value={formData.registration_date}
          onChange={(e) => setFormData({...formData, registration_date: e.target.value})}
        />
      </div>

      <div>
        <label>Address:</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Organization'}
      </button>
    </form>
  );
}
```

## 3.1. Get Organization by ID

Retrieve a specific organization by its ID.

### Endpoint
```
GET /organizations/{organization_id}
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Example Request
```javascript
const getOrganizationById = async (orgId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const organization = await response.json();
      console.log('Organization:', organization);
      return organization;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to get organization:', error);
    throw error;
  }
};
```

### Example Response
```json
{
  "id": "org-123",
  "name": "ABC Corporation",
  "tin": "001234567890",
  "category": "NON_INDIVIDUAL",
  "subcategory": "CORPORATION",
  "tax_classification": "VAT",
  "registration_date": "2024-01-01T00:00:00.000Z",
  "address": "Makati City, Philippines",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "deleted_at": null
}
```

Update an existing organization's information.

### Endpoint
```
PUT /organizations/{organization_id}
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
Only include fields you want to update (all fields are optional for updates):

```json
{
  "name": "Updated Corporation Name",
  "address": "456 Updated Street, Updated City",
  "tin": "001234567891"
}
```

### Example Request
```javascript
const updateOrganization = async (orgId, updateData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      const updatedOrg = await response.json();
      console.log('Organization updated:', updatedOrg);
      return updatedOrg;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to update organization:', error);
    throw error;
  }
};
```

### Frontend Implementation Example
```javascript
// React component for editing organizations
function EditOrganizationForm({ organization, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: organization.name || '',
    tin: organization.tin || '',
    category: organization.category || 'NON_INDIVIDUAL',
    subcategory: organization.subcategory || 'CORPORATION',
    tax_classification: organization.tax_classification || 'VAT',
    registration_date: organization.registration_date ?
      organization.registration_date.split('T')[0] : '',
    address: organization.address || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/org/organizations/${organization.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getJwtToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedOrg = await response.json();
        onSave(updatedOrg);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Organization</h2>

      {/* Same form fields as create form */}
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      {/* ... other form fields ... */}

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Organization'}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
```

## 4. Update Organization Business Status

Update an organization's business status (ACTIVE, INACTIVE, etc.).

### Endpoint
```
GET /organizations/{id}/status
PUT /organizations/{id}/status
PATCH /organizations/{id}/status
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### GET Status Request
```javascript
const getOrganizationStatus = async (orgId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const status = await response.json();
      console.log('Organization status:', status);
      return status;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to get organization status:', error);
    throw error;
  }
};
```

### PUT/PATCH Status Request Body
```json
{
  "status": "ACTIVE",
  "reason": "EXPIRED",
  "description": "Organization license has expired"
}
```

### Status Options
- `REGISTERED` - Successfully registered with BIR
- `PENDING_REG` - Application submitted but not completed
- `ACTIVE` - Currently operating
- `INACTIVE` - Temporarily not operating
- `CESSATION` - Operations stopped, closing process ongoing
- `CLOSED` - Deregistered / business officially closed
- `NON_COMPLIANT` - Active but flagged for missed filings
- `UNDER_AUDIT` - Under LOA / investigation by BIR
- `SUSPENDED` - Temporarily suspended by regulatory order

### Reason Options
- `EXPIRED` - License/registration expired
- `OPTED_OUT` - Voluntary cessation
- `PAYMENT_PENDING` - Outstanding payments
- `VIOLATIONS` - Regulatory violations

### Example Request
```javascript
const updateOrganizationStatus = async (orgId, statusData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Status updated:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to update status:', error);
    throw error;
  }
};
```

## 5. Get Organization Operation Details

Retrieve fiscal year settings, cut-off dates, and operational parameters for an organization.

### Endpoint
```
GET /organizations/{id}/operation
PUT /organizations/{id}/operation
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### GET Operation Request
```javascript
const getOrganizationOperation = async (orgId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/operation`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const operation = await response.json();
      console.log('Organization operation:', operation);
      return operation;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to get organization operation:', error);
    throw error;
  }
};
```

### PUT Operation Request Body
```json
{
  "fy_start": "2025-01-01",
  "fy_end": "2025-12-31",
  "vat_reg_effectivity": "2025-01-01",
  "registration_effectivity": "2025-01-01",
  "payroll_cut_off": ["15", "30"],
  "payment_cut_off": ["10", "25"],
  "quarter_closing": ["03-31", "06-30", "09-30", "12-31"],
  "has_foreign": false,
  "has_employees": true,
  "is_ewt": false,
  "is_fwt": false,
  "is_bir_withholding_agent": false,
  "accounting_method": "ACCRUAL"
}
```

### Example PUT Request
```javascript
const updateOrganizationOperation = async (orgId, operationData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/operation`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Operation updated:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to update operation:', error);
    throw error;
  }
};
```

Retrieve a list of all active tax obligations.

### Endpoint
```
GET /tax-obligations
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Example Request
```javascript
const fetchTaxObligations = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/org/tax-obligations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const taxObligations = await response.json();
      console.log('Tax obligations:', taxObligations);
      return taxObligations;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to fetch tax obligations:', error);
    throw error;
  }
};
```

### Example Response
```json
[
  {
    "id": "tax-123",
    "code": "VAT_MONTHLY_001",
    "name": "Monthly VAT Filing",
    "frequency": "MONTHLY",
    "due_rule": {
      "day": 20
    },
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "tax-124",
    "code": "INCOME_TAX_001",
    "name": "Annual Income Tax",
    "frequency": "ANNUAL",
    "due_rule": {
      "month": 4,
      "day": 15
    },
    "active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Frontend Implementation Example
```javascript
// React component to display tax obligations
function TaxObligationsList() {
  const [taxObligations, setTaxObligations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxObligations();
  }, []);

  const fetchTaxObligations = async () => {
    try {
      const response = await fetch('/api/org/tax-obligations', {
        headers: {
          'Authorization': `Bearer ${getJwtToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTaxObligations(data);
      }
    } catch (error) {
      console.error('Failed to fetch tax obligations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Tax Obligations</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Frequency</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {taxObligations.map(obligation => (
              <tr key={obligation.id}>
                <td>{obligation.code}</td>
                <td>{obligation.name}</td>
                <td>{obligation.frequency}</td>
                <td>{obligation.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## 6. View a Specific Organization's Tax Obligations Schedules

Retrieve compliance schedules for a specific organization's tax obligations.

### Endpoint
```
GET /organizations/{organization_id}/schedules
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Query Parameters (Optional)
- `start_date`: Start date for schedule generation (defaults to today)
- `end_date`: End date for schedule generation (defaults to 1 year from now)

### Example Request
```javascript
const fetchOrganizationSchedules = async (orgId, startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(
      `http://localhost:3000/api/org/organizations/${orgId}/schedules?${params}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const schedules = await response.json();
      console.log('Organization schedules:', schedules);
      return schedules;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to fetch organization schedules:', error);
    throw error;
  }
};
```

### Example Response
```json
[
  {
    "id": "schedule-123",
    "org_obligation_id": "org-obl-123",
    "period": "2024-01",
    "due_date": "2024-01-20T00:00:00.000Z",
    "status": "DUE",
    "filed_at": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "obligation": {
      "id": "tax-123",
      "code": "VAT_MONTHLY_001",
      "name": "Monthly VAT Filing",
      "frequency": "MONTHLY"
    }
  },
  {
    "id": "schedule-124",
    "org_obligation_id": "org-obl-124",
    "period": "2024-04",
    "due_date": "2024-04-15T00:00:00.000Z",
    "status": "DUE",
    "filed_at": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "obligation": {
      "id": "tax-124",
      "code": "INCOME_TAX_001",
      "name": "Annual Income Tax",
      "frequency": "ANNUAL"
    }
  }
]
```

### Frontend Implementation Example
```javascript
// React component to display organization schedules
function OrganizationSchedules({ organizationId }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, [organizationId, dateRange]);

  const fetchSchedules = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);

      const response = await fetch(
        `/api/org/organizations/${organizationId}/schedules?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${getJwtToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DUE': return 'orange';
      case 'FILED': return 'green';
      case 'LATE': return 'red';
      case 'EXEMPT': return 'gray';
      default: return 'black';
    }
  };

  return (
    <div>
      <h3>Tax Compliance Schedules</h3>

      <div>
        <label>Start Date:</label>
        <input
          type="date"
          value={dateRange.start_date}
          onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
        />

        <label>End Date:</label>
        <input
          type="date"
          value={dateRange.end_date}
          onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
        />

        <button onClick={fetchSchedules}>Filter</button>
      </div>

      {loading ? (
        <p>Loading schedules...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tax Obligation</th>
              <th>Period</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Filed At</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(schedule => (
              <tr key={schedule.id}>
                <td>{schedule.obligation?.name || 'N/A'}</td>
                <td>{schedule.period}</td>
                <td>{new Date(schedule.due_date).toLocaleDateString()}</td>
                <td style={{ color: getStatusColor(schedule.status) }}>
                  {schedule.status}
                </td>
                <td>
                  {schedule.filed_at ?
                    new Date(schedule.filed_at).toLocaleDateString() :
                    'Not filed'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## 7. Assign Tax Obligations to Organizations

Assign specific tax obligations to organizations with custom start/end dates.

### Endpoint
```
POST /organizations/{orgId}/obligations
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "obligation_id": "tax-obligation-uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "notes": "Assigned during initial setup"
}
```

### Example Request
```javascript
const assignObligation = async (orgId, obligationData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/obligations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obligationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Obligation assigned:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to assign obligation:', error);
    throw error;
  }
};
```

## 8. Update Organization Business Status

Update an organization's business status (ACTIVE, INACTIVE, etc.).

### Endpoint
```
PUT /organizations/{id}/status
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "status": "ACTIVE",
  "reason": "EXPIRED",
  "description": "Organization license has expired"
}
```

### Status Options
- `REGISTERED` - Successfully registered with BIR
- `PENDING_REG` - Application submitted but not completed
- `ACTIVE` - Currently operating
- `INACTIVE` - Temporarily not operating
- `CESSATION` - Operations stopped, closing process ongoing
- `CLOSED` - Deregistered / business officially closed
- `NON_COMPLIANT` - Active but flagged for missed filings
- `UNDER_AUDIT` - Under LOA / investigation by BIR
- `SUSPENDED` - Temporarily suspended by regulatory order

### Reason Options
- `EXPIRED` - License/registration expired
- `OPTED_OUT` - Voluntary cessation
- `PAYMENT_PENDING` - Outstanding payments
- `VIOLATIONS` - Regulatory violations

### Example Request
```javascript
const updateOrganizationStatus = async (orgId, statusData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Status updated:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to update status:', error);
    throw error;
  }
};
```

## 9. Update Organization Operation Details

Update fiscal year settings, cut-off dates, and operational parameters.

### Endpoint
```
PUT /organizations/{id}/operation
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "fy_start": "2025-01-01",
  "fy_end": "2025-12-31",
  "vat_reg_effectivity": "2025-01-01",
  "registration_effectivity": "2025-01-01",
  "payroll_cut_off": ["15", "30"],
  "payment_cut_off": ["10", "25"],
  "quarter_closing": ["03-31", "06-30", "09-30", "12-31"],
  "has_foreign": false,
  "has_employees": true,
  "is_ewt": false,
  "is_fwt": false,
  "is_bir_withholding_agent": false,
  "accounting_method": "ACCRUAL"
}
```

### Example Request
```javascript
const updateOrganizationOperation = async (orgId, operationData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/operation`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(operationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Operation updated:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to update operation:', error);
    throw error;
  }
};
```

## 10. Update Organization Registration Details

Update BIR registration information.

### Endpoint
```
PUT /organizations/{id}/registration
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "trade_name": "ABC Trading",
  "line_of_business": "6201",
  "address_line": "123 Main Street",
  "region": "NCR",
  "city": "Makati",
  "zip_code": "1223",
  "tin": "001234567890",
  "rdo_code": "001",
  "contact_number": "+639123456789",
  "email_address": "john.doe@example.com",
  "tax_type": "VAT",
  "start_date": "2024-01-01",
  "reg_date": "2024-01-01"
}
```

### Example Request
```javascript
const updateOrganizationRegistration = async (orgId, registrationData) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/registration`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Registration updated:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to update registration:', error);
    throw error;
  }
};
```

## 11. Create Tax Obligation

Create a new tax obligation definition (admin only).

### Endpoint
```
POST /tax-obligations
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "code": "VAT_MONTHLY_001",
  "name": "Monthly Value-Added Tax Return",
  "frequency": "MONTHLY",
  "due_rule": {
    "day": 20,
    "month_offset": 1
  },
  "status": "MANDATORY"
}
```

### Example Request
```javascript
const createTaxObligation = async (obligationData) => {
  try {
    const response = await fetch('http://localhost:3000/api/org/tax-obligations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obligationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Tax obligation created:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to create tax obligation:', error);
    throw error;
  }
};
```

## 12. Organization Owners Management

Manage organization ownership assignments (super admin only).

### Endpoints
```
POST /organizations/{orgId}/owners
GET /organizations/{orgId}/owners
DELETE /organizations/{orgId}/owners/{userId}
DELETE /organization-owners/{id}
GET /organizations/{orgId}/ownership
```

### Assign Owner
Assign a user as an owner of an organization.

#### Request Body
```json
{
  "org_id": "organization-uuid",
  "user_id": "user-uuid"
}
```

#### Example Request
```javascript
const assignOwner = async (orgId, userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/owners`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        org_id: orgId,
        user_id: userId
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Owner assigned:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to assign owner:', error);
    throw error;
  }
};
```

### Get Organization Owners
Retrieve all owners of an organization.

#### Example Request
```javascript
const getOrganizationOwners = async (orgId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/owners`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Organization owners:', result.owners);
      return result.owners;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to get owners:', error);
    throw error;
  }
};
```

### Check Ownership
Check if the current user is an owner of an organization.

#### Example Request
```javascript
const checkOwnership = async (orgId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/ownership`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Ownership check:', result);
      return result.is_owner;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to check ownership:', error);
    throw error;
  }
};
```

### Remove Owner
Remove a user as an owner of an organization.

#### Example Request
```javascript
const removeOwner = async (orgId, userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/org/organizations/${orgId}/owners/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Owner removed:', result);
      return result;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to remove owner:', error);
    throw error;
  }
};
```

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages:

### Common Error Responses
```json
{
  "statusCode": 400,
  "message": "Bad Request - Invalid data provided",
  "error": "Bad Request"
}

{
  "statusCode": 401,
  "message": "Unauthorized - Invalid or missing JWT token",
  "error": "Unauthorized"
}

{
  "statusCode": 403,
  "message": "Forbidden - Insufficient permissions",
  "error": "Forbidden"
}

{
  "statusCode": 404,
  "message": "Not Found - Resource not found",
  "error": "Not Found"
}

{
  "statusCode": 409,
  "message": "Conflict - Resource already exists",
  "error": "Conflict"
}

{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "Internal Server Error"
}
```

### Frontend Error Handling Example
```javascript
const handleApiError = (error, response) => {
  switch (response.status) {
    case 401:
      // Redirect to login or refresh token
      redirectToLogin();
      break;
    case 403:
      alert('You do not have permission to perform this action');
      break;
    case 404:
      alert('The requested resource was not found');
      break;
    case 409:
      alert('This resource already exists');
      break;
    default:
      alert(`Error: ${error.message || 'Unknown error occurred'}`);
  }
};
```

## API Documentation

### Complete OpenAPI Specification
A comprehensive OpenAPI 3.0 YAML specification is available at:
```
checkpoint/org-mgmt-api.yaml
```

This specification includes:
- All API endpoints with detailed request/response schemas
- Authentication requirements (JWT Bearer tokens)
- Complete data models and enums
- Error response definitions
- Interactive examples for testing

### Swagger UI Documentation
Interactive API documentation is available via Swagger UI at:
```
http://localhost:3000/docs
```

This provides an interactive interface where you can test all endpoints directly from the browser.

## Additional Notes

1. **Soft Deletes**: Organizations are soft-deleted (marked as deleted but not removed from database)
2. **Automatic Setup**: When creating an organization, the system automatically creates default operation settings and status
3. **Tax Obligations**: Only active tax obligations are returned by the API
4. **Schedule Generation**: Schedules are generated dynamically based on assigned tax obligations and their due rules
5. **Date Formats**: Use ISO 8601 format (YYYY-MM-DD) for date fields in requests
6. **Permissions**: All endpoints require appropriate permissions based on the operation type
7. **Validation**: All requests are validated using class-validator decorators
8. **Relationships**: The API maintains proper relationships between organizations, obligations, and schedules
9. **Enums**: All enum values are strictly validated - refer to the OpenAPI spec for valid values
10. **JWT Tokens**: Tokens must be included in the Authorization header as `Bearer <token>`</content>
<parameter name="filePath">c:\Users\Raenerys\Documents\Windbooks\org-mgmt-api\FRONTEND_INTEGRATION_GUIDE.md