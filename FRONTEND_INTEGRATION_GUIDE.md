# Organization Management API - Superadmin Frontend Integration Guide

This guide provides comprehensive documentation for frontend applications integrating with the Organization Management API using a superadmin account. The API provides full access to organization management, tax obligations, and compliance schedules.

## Authentication

Superadmin accounts have unrestricted access to all API endpoints. Authentication is handled via JWT tokens with the following permissions:
- `resource:create` - Create organizations and resources
- `resource:read` - Read all organizations and resources
- `resource:update` - Update organizations and resources
- `resource:delete` - Delete organizations and resources
- `tax:configure` - Configure tax obligations and settings
- `*` - Wildcard permission for full access

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

## API Base URL
```
http://localhost:3000
```

## API Endpoint Structure

All API endpoints use the `/api/org` prefix, except for health and documentation endpoints:
- **Organization Management**: `/api/org/organizations`
- **Tax Obligations**: `/api/org/tax-obligations`
- **Organization Obligations**: `/api/org/organizations/{id}/obligations`
- **Schedules**: `/api/org/organizations/{id}/schedules`
- **Health Check**: `/health` (no prefix)
- **API Documentation**: `/docs` (no prefix)

## 1. View All Organizations

Retrieve a list of all organizations with optional filtering.

### Endpoint
```
GET /api/org/organizations
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
POST /api/org/organizations
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
  "address": "123 Main Street, Makati City, Philippines"
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

## 3. Update Existing Organization

Update an existing organization's information.

### Endpoint
```
PUT /api/org/organizations/{organization_id}
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

## 4. Change Organization Status to Inactive

**Note**: The current API does not have a direct endpoint for changing organization status. Organization status is managed through the `OrganizationStatus` model, but no API endpoint currently exists for updating this status.

The organization status field is currently set to "PENDING" by default when an organization is created and is not exposed through the current API endpoints for updates.

If you need to implement organization status changes, you would need to add a new endpoint such as:
```
PUT /api/org/organizations/{organization_id}/status
```

With a request body like:
```json
{
  "status": "INACTIVE"
}
```

For now, this functionality is not available in the current API.

## 5. View All Tax Obligations

Retrieve a list of all active tax obligations.

### Endpoint
```
GET /api/org/tax-obligations
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
GET /api/org/organizations/{organization_id}/schedules
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
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "Internal Server Error"
}
```

### Frontend Error Handling Example
```javascript
const handleApiError = (error, response) => {
  if (response.status === 401) {
    // Redirect to login
    redirectToLogin();
  } else if (response.status === 403) {
    alert('You do not have permission to perform this action');
  } else if (response.status === 404) {
    alert('The requested resource was not found');
  } else {
    alert(`Error: ${error.message}`);
  }
};
```

## API Documentation

Complete API documentation is available via Swagger UI at:
```
http://localhost:3000/docs
```

This provides interactive documentation where you can test all endpoints directly from the browser.

## Additional Notes

1. **Soft Deletes**: Organizations are soft-deleted (marked as deleted but not removed from database)
2. **Automatic Setup**: When creating an organization, the system automatically creates default operation settings and status
3. **Tax Obligations**: Only active tax obligations are returned by the API
4. **Schedule Generation**: Schedules are generated dynamically based on assigned tax obligations and their due rules
5. **Date Formats**: Use ISO 8601 format (YYYY-MM-DD) for date fields
6. **Permissions**: Superadmin accounts bypass all permission checks and have access to all resources</content>
<parameter name="filePath">c:\Users\Raenerys\Documents\Windbooks\org-mgmt-api\FRONTEND_INTEGRATION_GUIDE.md