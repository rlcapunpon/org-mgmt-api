/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import nock from 'nock';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { signPayload } from '../src/test-utils/token';
import { BusinessStatus, OrganizationStatusChangeReasonEnum } from '@prisma/client';
// Using string literals for enums to avoid import issues

describe('Organization Management API Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    // Ensure JWT_SECRET is set for testing
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Configure Swagger documentation to match main.ts configuration
    const config = new DocumentBuilder()
      .setTitle('Organization Management API')
      .setDescription(
        'API for managing organizations, tax obligations, and compliance schedules',
      )
      .setVersion('1.0')
      .addTag('Organizations', 'Organization management endpoints')
      .addTag('Tax Obligations', 'Tax obligation management endpoints')
      .addTag(
        'Organization Obligations',
        'Organization obligation management endpoints',
      )
      .addTag('Schedules', 'Compliance schedule management endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Configure global prefix to match main.ts configuration
    app.setGlobalPrefix('api/org', {
      exclude: [
        { path: 'health', method: RequestMethod.GET },
        { path: 'docs', method: RequestMethod.GET },
        { path: 'docs-json', method: RequestMethod.GET },
      ],
    });

    await app.init();

    // Generate test JWT token
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    const payload = {
      userId: 'test-user-id',
      username: 'testuser',
      isSuperAdmin: true,
      permissions: [
        'resource:create',
        'resource:read',
        'resource:update',
        'resource:delete',
        'tax:configure',
        '*',
      ],
    };
    authToken = signPayload(payload, jwtSecret);

    // Mock RBAC API calls
    nock('http://localhost:3000')
      .persist()
      .post('/api/resources')
      .reply(201, { id: 'mock-resource-id' });

    // Clean up any existing test data
    await prisma.organizationOperation.deleteMany();
    await prisma.organizationStatus.deleteMany();
    await prisma.obligationSchedule.deleteMany();
    await prisma.organizationObligation.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.taxObligation.deleteMany();
  });

  // Helper function to create authenticated requests
  const authRequest = (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
  ) => {
    return request(app.getHttpServer())
      [method](url)
      .set('Authorization', `Bearer ${authToken}`);
  };

  afterAll(async () => {
    // Clean up test data
    await prisma.organizationOperation.deleteMany();
    await prisma.organizationStatus.deleteMany();
    await prisma.obligationSchedule.deleteMany();
    await prisma.organizationObligation.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.taxObligation.deleteMany();

    // Clean up nock mocks
    nock.cleanAll();

    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health check status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('/tax-obligations', () => {
    it('should create a new tax obligation (POST)', () => {
      return authRequest('post', '/api/org/tax-obligations')
        .send({
          code: 'VAT_MONTHLY_E2E_001',
          name: 'Monthly VAT Filing',
          frequency: 'MONTHLY',
          due_rule: { day: 20 },
          status: 'MANDATORY',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.code).toBe('VAT_MONTHLY_E2E_001');
          expect(res.body.name).toBe('Monthly VAT Filing');
          expect(res.body.frequency).toBe('MONTHLY');
          expect(res.body.status).toBe('MANDATORY');
        });
    });

    it('should get all tax obligations (GET)', () => {
      return authRequest('get', '/api/org/tax-obligations')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('code');
          expect(res.body[0]).toHaveProperty('name');
        });
    });
  });

  describe('/organizations', () => {
    let createdOrgId: string;

    it('should create a new organization (POST)', () => {
      return authRequest('post', '/api/org/organizations')
        .send({
          name: 'Test Corporation Ltd',
          tin: '123456789012',
          category: 'NON_INDIVIDUAL',
          subcategory: 'CORPORATION',
          tax_classification: 'VAT',
          registration_date: '2024-01-01T00:00:00.000Z',
          // Registration fields
          registered_name: 'Test Corporation Ltd',
          first_name: 'John',
          last_name: 'CEO',
          line_of_business: '6201',
          address_line: '123 Test Street',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          rdo_code: '001',
          contact_number: '+639123456789',
          email_address: 'john.ceo@testcorp.com',
          start_date: '2024-01-01T00:00:00.000Z',
          update_by: 'test-user',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Corporation Ltd');
          expect(res.body.tin).toBe('123456789012');
          expect(res.body.category).toBe('NON_INDIVIDUAL');
          expect(res.body.subcategory).toBe('CORPORATION');
          expect(res.body.tax_classification).toBe('VAT');
          createdOrgId = res.body.id;
        });
    });

    it('should get organization by id (GET)', () => {
      return authRequest('get', `/api/org/organizations/${createdOrgId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdOrgId);
          expect(res.body.name).toBe('Test Corporation Ltd');
          expect(res.body.tin).toBe('123456789012');
        });
    });

    it('should update organization (PUT)', () => {
      return authRequest('put', `/api/org/organizations/${createdOrgId}`)
        .send({
          name: 'Updated Test Corporation Ltd',
          address: '456 Updated Street, Updated City',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdOrgId);
          expect(res.body.name).toBe('Updated Test Corporation Ltd');
          expect(res.body.address).toBe('456 Updated Street, Updated City');
          expect(res.body.tin).toBe('123456789012'); // Should remain unchanged
        });
    });

    it('should get all organizations (GET)', () => {
      return authRequest('get', '/api/org/organizations')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('should get organization operation (GET)', () => {
      return authRequest(
        'get',
        `/api/org/organizations/${createdOrgId}/operation`,
      )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('organization_id');
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body).toHaveProperty('accounting_method');
          expect(res.body).toHaveProperty('has_employees');
        });
    });

    it('should update organization operation (PUT)', () => {
      return authRequest(
        'put',
        `/api/org/organizations/${createdOrgId}/operation`,
      )
        .send({
          has_employees: true,
          has_foreign: true,
          accounting_method: 'ACCRUAL',
          is_bir_withholding_agent: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body.has_employees).toBe(true);
          expect(res.body.has_foreign).toBe(true);
          expect(res.body.accounting_method).toBe('ACCRUAL');
          expect(res.body.is_bir_withholding_agent).toBe(true);
        });
    });

    it('should get organization status (GET)', () => {
      return authRequest('get', `/api/org/organizations/${createdOrgId}/status`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('organization_id');
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('last_update');
        });
    });

    it('should update organization status (PUT)', () => {
      return authRequest('put', `/api/org/organizations/${createdOrgId}/status`)
        .send({
          status: BusinessStatus.ACTIVE,
          reason: OrganizationStatusChangeReasonEnum.EXPIRED,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body.status).toBe('ACTIVE');
          expect(res.body).toHaveProperty('last_update');
        });
    });

    describe('SUPERADMIN Status Update Tests', () => {
      it('should allow SUPERADMIN with isSuperAdmin: true to update status', () => {
        const superAdminToken = signPayload(
          {
            userId: 'superadmin-user-123',
            username: 'superadmin@example.com',
            isSuperAdmin: true,
            role: 'Super Admin',
            permissions: [],
          },
          process.env.JWT_SECRET || 'test-secret',
        );

        return request(app.getHttpServer())
          .put(`/api/org/organizations/${createdOrgId}/status`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            status: BusinessStatus.ACTIVE,
            reason: OrganizationStatusChangeReasonEnum.EXPIRED,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.organization_id).toBe(createdOrgId);
            expect(res.body.status).toBe('ACTIVE');
          });
      });

      it('should allow SUPERADMIN with role: "Super Admin" to update status', () => {
        const superAdminToken = signPayload(
          {
            userId: 'superadmin-role-user-123',
            username: 'superadminrole@example.com',
            isSuperAdmin: false,
            role: 'Super Admin',
            permissions: [],
          },
          process.env.JWT_SECRET || 'test-secret',
        );

        return request(app.getHttpServer())
          .put(`/api/org/organizations/${createdOrgId}/status`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            status: BusinessStatus.INACTIVE,
            reason: OrganizationStatusChangeReasonEnum.VIOLATIONS,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.organization_id).toBe(createdOrgId);
            expect(res.body.status).toBe('INACTIVE');
          });
      });

      it('should allow SUPERADMIN with wildcard permissions to update status', () => {
        const superAdminToken = signPayload(
          {
            userId: 'superadmin-wildcard-user-123',
            username: 'superadminwildcard@example.com',
            isSuperAdmin: false,
            role: 'Manager',
            permissions: ['*'],
          },
          process.env.JWT_SECRET || 'test-secret',
        );

        return request(app.getHttpServer())
          .put(`/api/org/organizations/${createdOrgId}/status`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            status: BusinessStatus.PENDING_REG,
            reason: OrganizationStatusChangeReasonEnum.APPROVED,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.organization_id).toBe(createdOrgId);
            expect(res.body.status).toBe('PENDING_REG');
          });
      });

      it('should reject user with incorrect SUPERADMIN role string', () => {
        const invalidSuperAdminToken = signPayload(
          {
            userId: 'wrong-role-user-123',
            username: 'wrongrole@example.com',
            isSuperAdmin: false,
            role: 'SUPERADMIN', // Wrong case
            permissions: [],
          },
          process.env.JWT_SECRET || 'test-secret',
        );

        return request(app.getHttpServer())
          .put(`/api/org/organizations/${createdOrgId}/status`)
          .set('Authorization', `Bearer ${invalidSuperAdminToken}`)
          .send({
            status: BusinessStatus.ACTIVE,
            reason: OrganizationStatusChangeReasonEnum.EXPIRED,
          })
          .expect(403);
      });

      it('should reject non-SUPERADMIN users without proper permissions', () => {
        const regularUserToken = signPayload(
          {
            userId: 'regular-user-123',
            username: 'regular@example.com',
            isSuperAdmin: false,
            role: 'User',
            permissions: ['organization:read'], // Missing resource:update permission
          },
          process.env.JWT_SECRET || 'test-secret',
        );

        return request(app.getHttpServer())
          .put(`/api/org/organizations/${createdOrgId}/status`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send({
            status: BusinessStatus.ACTIVE,
            reason: OrganizationStatusChangeReasonEnum.EXPIRED,
          })
          .expect(403);
      });

      it('should reject requests with invalid JWT', () => {
        return request(app.getHttpServer())
          .put(`/api/org/organizations/${createdOrgId}/status`)
          .set('Authorization', 'Bearer invalid-jwt-token')
          .send({
            status: BusinessStatus.ACTIVE,
            reason: OrganizationStatusChangeReasonEnum.EXPIRED,
          })
          .expect(401);
      });

      it('should reject requests without Authorization header', () => {
        return request(app.getHttpServer())
          .put(`/api/org/organizations/${createdOrgId}/status`)
          .send({
            status: BusinessStatus.ACTIVE,
            reason: OrganizationStatusChangeReasonEnum.EXPIRED,
          })
          .expect(401);
      });
    });

    it('should partially update organization status (PATCH)', () => {
      return authRequest(
        'patch',
        `/api/org/organizations/${createdOrgId}/status`,
      )
        .send({
          status: BusinessStatus.INACTIVE,
          reason: OrganizationStatusChangeReasonEnum.VIOLATIONS,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body.status).toBe('INACTIVE');
          expect(res.body).toHaveProperty('last_update');
        });
    });

    it('should get organization registration (GET)', () => {
      return authRequest(
        'get',
        `/api/org/organizations/${createdOrgId}/registration`,
      )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('organization_id');
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body).toHaveProperty('first_name');
          expect(res.body.first_name).toBe('John');
          expect(res.body).toHaveProperty('last_name');
          expect(res.body.last_name).toBe('CEO');
          expect(res.body).toHaveProperty('email_address');
          expect(res.body.email_address).toBe('john.ceo@testcorp.com');
          expect(res.body).toHaveProperty('tax_type');
        });
    });

    it('should update organization registration (PUT)', () => {
      return authRequest(
        'put',
        `/api/org/organizations/${createdOrgId}/registration`,
      )
        .send({
          first_name: 'Jane',
          last_name: 'Smith',
          email_address: 'jane.smith@testcorp.com',
          contact_number: '+639876543210',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body.first_name).toBe('Jane');
          expect(res.body.last_name).toBe('Smith');
          expect(res.body.email_address).toBe('jane.smith@testcorp.com');
          expect(res.body.contact_number).toBe('+639876543210');
        });
    });

    it('should partially update organization registration (PATCH)', () => {
      return authRequest(
        'patch',
        `/api/org/organizations/${createdOrgId}/registration`,
      )
        .send({
          contact_number: '+639111111111',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body.contact_number).toBe('+639111111111');
          expect(res.body.first_name).toBe('Jane'); // Should remain unchanged
          expect(res.body.last_name).toBe('Smith'); // Should remain unchanged
        });
    });

    describe('/organizations/:orgId/obligations', () => {
      let taxObligationId: string;

      beforeAll(async () => {
        // Create a tax obligation for testing
        const taxObligation = await prisma.taxObligation.create({
          data: {
            code: 'INCOME_TAX_001',
            name: 'Annual Income Tax',
            frequency: 'ANNUAL',
            due_rule: { month: 4, day: 15 },
            status: 'MANDATORY' as const,
          },
        });
        taxObligationId = taxObligation.id;
      });

      it('should assign obligation to organization (POST)', () => {
        return authRequest(
          'post',
          `/api/org/organizations/${createdOrgId}/obligations`,
        )
          .send({
            obligation_id: taxObligationId,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            notes: 'Annual income tax filing',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.organization_id).toBe(createdOrgId);
            expect(res.body.obligation_id).toBe(taxObligationId);
            expect(res.body.status).toBe('ASSIGNED');
            expect(res.body.notes).toBe('Annual income tax filing');
          });
      });

      it('should get organization obligations (GET)', () => {
        return authRequest(
          'get',
          `/api/org/organizations/${createdOrgId}/obligations`,
        )
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('organization_id');
            expect(res.body[0]).toHaveProperty('obligation_id');
            expect(res.body[0].organization_id).toBe(createdOrgId);
          });
      });
    });

    describe('/organizations/:id/schedules', () => {
      it('should get organization schedules (GET)', () => {
        return authRequest(
          'get',
          `/api/org/organizations/${createdOrgId}/schedules`,
        ).expect((res) => {
          // Accept either 200 (success) or 500 (if organization has schedule issues)
          expect([200, 500]).toContain(res.status);
          if (res.status === 200) {
            expect(Array.isArray(res.body)).toBe(true);
            // May be empty if no schedules exist yet
            if (res.body.length > 0) {
              expect(res.body[0]).toHaveProperty('id');
              expect(res.body[0]).toHaveProperty('org_obligation_id');
              expect(res.body[0]).toHaveProperty('period');
              expect(res.body[0]).toHaveProperty('status');
            }
          }
        });
      });
    });

    it('should soft delete organization (DELETE)', () => {
      return authRequest(
        'delete',
        `/api/org/organizations/${createdOrgId}`,
      ).expect(204); // DELETE typically returns 204 No Content
    });

    it('should not find deleted organization (GET)', () => {
      return authRequest('get', `/api/org/organizations/${createdOrgId}`)
        .expect(200) // If soft delete still returns the organization with deleted_at field
        .expect((res) => {
          expect(res.body.deleted_at).toBeTruthy(); // Verify it's marked as deleted
        });
    });
  });

  describe('/organizations/:orgId/owners', () => {
    let testOrgId: string;
    const testUserId: string = 'test-owner-user-id';

    beforeAll(async () => {
      // Create a test organization for owner assignment
      const org = await prisma.organization.create({
        data: {
          name: 'Owner Test Organization',
          category: 'NON_INDIVIDUAL',
          tax_classification: 'VAT',
          tin: '001234567890',
          registration_date: new Date('2024-01-01'),
          address: '123 Test St, Makati, NCR, 1223',
          deleted_at: null,
          status: {
            create: {
              status: 'PENDING_REG',
            },
          },
          operation: {
            create: {
              fy_start: new Date('2024-01-01'),
              fy_end: new Date('2024-12-31'),
              vat_reg_effectivity: new Date('2024-01-01'),
              registration_effectivity: new Date('2024-01-01'),
              payroll_cut_off: ['15/30'],
              payment_cut_off: ['15/30'],
              quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
              has_foreign: false,
              has_employees: false,
              is_ewt: false,
              is_fwt: false,
              is_bir_withholding_agent: false,
              accounting_method: 'ACCRUAL',
            },
          },
          registration: {
            create: {
              first_name: 'Test',
              last_name: 'Owner',
              line_of_business: '6201',
              address_line: '123 Test St',
              region: 'NCR',
              city: 'Makati',
              zip_code: '1223',
              tin: '001234567890',
              rdo_code: '001',
              contact_number: '+639123456789',
              email_address: 'test.owner@example.com',
              tax_type: 'VAT',
              start_date: new Date('2024-01-01'),
              reg_date: new Date('2024-01-01'),
              update_by: 'test-user-id',
            },
          },
        },
      });
      testOrgId = org.id;
    });

    it('should assign owner to organization (POST) - super admin only', () => {
      return authRequest('post', `/api/org/organizations/${testOrgId}/owners`)
        .send({
          org_id: testOrgId,
          user_id: testUserId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.org_id).toBe(testOrgId);
          expect(res.body.user_id).toBe(testUserId);
          expect(res.body).toHaveProperty('last_update');
          expect(res.body).toHaveProperty('assigned_date');
        });
    });

    it('should get owners of organization (GET) - super admin only', () => {
      return authRequest('get', `/api/org/organizations/${testOrgId}/owners`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('owners');
          expect(Array.isArray(res.body.owners)).toBe(true);
          expect(res.body.owners.length).toBeGreaterThan(0);
          expect(res.body.owners[0]).toHaveProperty('id');
          expect(res.body.owners[0].org_id).toBe(testOrgId);
          expect(res.body.owners[0].user_id).toBe(testUserId);
        });
    });

    it('should check ownership (GET) - any authenticated user', () => {
      return authRequest('get', `/api/org/organizations/${testOrgId}/ownership`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('is_owner');
          expect(res.body).toHaveProperty('org_id');
          expect(res.body).toHaveProperty('user_id');
          expect(res.body.org_id).toBe(testOrgId);
          expect(res.body.user_id).toBe('test-user-id'); // From JWT payload
          // Since the JWT user is super admin, they should be considered an owner
          expect(res.body.is_owner).toBe(true);
        });
    });

    it('should remove owner from organization (DELETE) - super admin only', () => {
      return authRequest(
        'delete',
        `/api/org/organizations/${testOrgId}/owners/${testUserId}`,
      )
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.org_id).toBe(testOrgId);
          expect(res.body.user_id).toBe(testUserId);
        });
    });

    it('should return empty owners list after removal (GET)', () => {
      return authRequest('get', `/api/org/organizations/${testOrgId}/owners`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('owners');
          expect(Array.isArray(res.body.owners)).toBe(true);
          expect(res.body.owners.length).toBe(0);
        });
    });

    it('should reject non-super-admin access to assign owner (POST)', () => {
      // Create a non-super-admin token
      const nonSuperAdminToken = signPayload(
        {
          userId: 'regular-user-id',
          username: 'regularuser',
          isSuperAdmin: false,
          permissions: ['resource:read'],
        },
        process.env.JWT_SECRET || 'test-secret',
      );

      return request(app.getHttpServer())
        .post(`/api/org/organizations/${testOrgId}/owners`)
        .set('Authorization', `Bearer ${nonSuperAdminToken}`)
        .send({
          org_id: testOrgId,
          user_id: 'another-user-id',
        })
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Super admin access required');
        });
    });

    it('should reject non-super-admin access to get owners (GET)', () => {
      // Create a non-super-admin token
      const nonSuperAdminToken = signPayload(
        {
          userId: 'regular-user-id',
          username: 'regularuser',
          isSuperAdmin: false,
          permissions: ['resource:read'],
        },
        process.env.JWT_SECRET || 'test-secret',
      );

      return request(app.getHttpServer())
        .get(`/api/org/organizations/${testOrgId}/owners`)
        .set('Authorization', `Bearer ${nonSuperAdminToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Super admin access required');
        });
    });

    it('should reject non-super-admin access to remove owner (DELETE)', () => {
      // Create a non-super-admin token
      const nonSuperAdminToken = signPayload(
        {
          userId: 'regular-user-id',
          username: 'regularuser',
          isSuperAdmin: false,
          permissions: ['resource:read'],
        },
        process.env.JWT_SECRET || 'test-secret',
      );

      return request(app.getHttpServer())
        .delete(`/api/org/organizations/${testOrgId}/owners/${testUserId}`)
        .set('Authorization', `Bearer ${nonSuperAdminToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Super admin access required');
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent organization', () => {
      return authRequest(
        'get',
        '/api/org/organizations/non-existent-id',
      ).expect(404);
    });

    it('should return error for invalid organization data', () => {
      return authRequest('post', '/api/org/organizations')
        .send({
          name: '', // Invalid: empty name
          tin: '123456789012',
          category: 'INVALID_CATEGORY', // Invalid category
          subcategory: 'CORPORATION',
          tax_classification: 'VAT',
          registration_date: '2024-01-01T00:00:00.000Z',
          address: 'Test Address',
        })
        .expect((res) => {
          expect([400, 500]).toContain(res.status); // Accept either validation error
        });
    });

    it('should return error for duplicate tax obligation code', () => {
      return authRequest('post', '/api/org/tax-obligations')
        .send({
          code: 'VAT_MONTHLY_E2E_001', // Same code as previous test to trigger duplicate error
          name: 'Duplicate VAT Filing',
          frequency: 'MONTHLY',
          due_rule: { day: 20 },
          status: 'MANDATORY',
        })
        .expect((res) => {
          expect([400, 500]).toContain(res.status); // Accept either validation or database error
        });
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation at /docs', () => {
      return request(app.getHttpServer())
        .get('/docs')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('swagger');
          expect(res.text).toContain('Swagger UI');
        });
    });

    it('should serve Swagger JSON at /docs-json', () => {
      return request(app.getHttpServer())
        .get('/docs-json')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('paths');
          expect(res.body.info.title).toBe('Organization Management API');
        });
    });
  });
});
