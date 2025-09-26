# Organization Management API

A comprehensive REST API for managing Philippine tax compliance and organization data, built with NestJS, TypeScript, and Prisma.

## Overview

This API serves as the central system for managing organizations, their tax obligations, compliance schedules, and regulatory status within the Philippine tax ecosystem. It integrates with external RBAC services for authentication and authorization, and provides a complete solution for tax compliance management.

## Features

### 🏢 Organization Management
- Complete organization lifecycle management
- Philippine tax registration data (BIR integration)
- Organization status tracking with comprehensive state management
- Business classification and categorization

### 📋 Tax Obligation Management
- Dynamic tax obligation assignment based on business classification
- Support for various tax types (VAT, Non-VAT, Exempt)
- Automated schedule generation for tax filings and payments
- Status-based obligation management (Mandatory, Optional, Exempt, etc.)

### 📅 Compliance Scheduling
- Automated generation of tax filing and payment schedules
- Due date calculation and tracking
- Compliance status monitoring
- Historical obligation tracking

### 🔐 Security & Authorization
- JWT-based authentication with external RBAC integration
- Granular permission system (`resource.action:scope`)
- Role-based access control (Super Admin, User roles)
- Secure API endpoints with proper validation

### 📊 Status Management
- Organization status lifecycle (Registered, Active, Inactive, Closed, etc.)
- Tax obligation status tracking
- Change reason logging and audit trails
- Compliance monitoring and alerts

## Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: TypeScript
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with comprehensive test coverage
- **Development**: ESLint, Prettier, Husky

## Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd org-mgmt-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database (development)
npm run dev:reset

# Run database migrations (production)
npm run migrate
```

### Development

```bash
# Start development server with hot reload
npm run start:dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Generate test coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

### Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## API Documentation

Once the server is running, visit:
- **API Documentation**: `http://localhost:3000/docs` (Swagger UI)
- **Health Check**: `http://localhost:3000/health`

## Key Endpoints

### Organizations
- `POST /organizations` - Create new organization
- `GET /organizations` - List organizations
- `GET /organizations/:id` - Get organization details
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Soft delete organization

### Tax Obligations
- `POST /tax-obligations` - Create tax obligation
- `GET /tax-obligations` - List active tax obligations
- `GET /tax-obligations/:id` - Get tax obligation details

### Organization Status
- `GET /organizations/:id/status` - Get organization status
- `PUT /organizations/:id/status` - Update organization status
- `PATCH /organizations/:id/status` - Partially update status

### Organization Operations
- `GET /organizations/:id/operation` - Get operation details
- `PUT /organizations/:id/operation` - Update operation settings

### Schedules
- `GET /organizations/:id/schedules` - Get compliance schedules
- `GET /organizations/:id/obligations` - Get organization obligations

## Database Schema

### Core Entities
- **Organization**: Main entity for businesses/taxpayers
- **TaxObligation**: Tax requirements and obligations
- **OrganizationObligation**: Links organizations to their obligations
- **ObligationSchedule**: Generated filing/payment schedules
- **OrganizationStatus**: Current status and state
- **OrganizationOperation**: Operational settings and dates
- **OrganizationRegistration**: BIR registration details

### Enums
- **BusinessStatus**: Organization lifecycle states
- **TaxObligationStatus**: Obligation requirement levels
- **TaxClassification**: VAT/Non-VAT/Exempt classifications
- **ScheduleStatus**: Filing/payment status tracking

## Testing Strategy

This project follows strict Test-Driven Development (TDD) principles:

### Test Coverage
- **Unit Tests**: Repository, service, and controller logic
- **Integration Tests**: End-to-end API testing
- **Database Tests**: Schema validation and queries
- **Coverage Target**: Minimum 85% per file

### Test Categories
- Repository layer tests with Prisma mocks
- Service layer business logic tests
- Controller endpoint tests
- E2E API integration tests
- Database connectivity and schema tests

## Development Workflow

1. **TDD Approach**: Write failing tests first, then implement
2. **Code Quality**: ESLint + Prettier enforced
3. **Git Workflow**: Feature branches with comprehensive commits
4. **Documentation**: Update README and API docs for changes
5. **Testing**: All tests must pass before merge

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/org_mgmt_db"

# JWT
JWT_SECRET="your-jwt-secret-here"

# External Services
RBAC_API_URL="https://rbac-service.example.com"

# Application
NODE_ENV="development"
PORT=3000
```

## Contributing

1. Follow the established TDD workflow
2. Maintain test coverage above 85%
3. Update documentation for API changes
4. Ensure all tests pass before submitting PR
5. Follow conventional commit messages

## License

This project is proprietary and unlicensed for external use.

## Support

For questions or support, please contact the development team.
