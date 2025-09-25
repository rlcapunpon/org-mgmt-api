import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { signPayload } from '../src/test-utils/token';
// Using string literals for enums to avoid import issues

describe('Organization Management API Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Generate test JWT token
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    const payload = {
      sub: 'test-user-id',
      username: 'testuser',
      permissions: ['resource:create', 'resource:read', 'resource:update', 'resource:delete', 'tax:configure', '*']
    };
    authToken = signPayload(payload, jwtSecret);

    // Clean up any existing test data
    await prisma.organizationOperation.deleteMany();
    await prisma.organizationStatus.deleteMany();
    await prisma.obligationSchedule.deleteMany();
    await prisma.organizationObligation.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.taxObligation.deleteMany();
  });

  // Helper function to create authenticated requests
  const authRequest = (method: 'get' | 'post' | 'put' | 'delete', url: string) => {
    return request(app.getHttpServer())[method](url).set('Authorization', `Bearer ${authToken}`);
  };

  afterAll(async () => {
    // Clean up test data
    await prisma.organizationOperation.deleteMany();
    await prisma.organizationStatus.deleteMany();
    await prisma.obligationSchedule.deleteMany();
    await prisma.organizationObligation.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.taxObligation.deleteMany();
    
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
      return request(app.getHttpServer())
        .post('/tax-obligations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'VAT_MONTHLY_001',
          name: 'Monthly VAT Filing',
          frequency: "MONTHLY",
          due_rule: { day: 20 },
          active: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.code).toBe('VAT_MONTHLY_001');
          expect(res.body.name).toBe('Monthly VAT Filing');
          expect(res.body.frequency).toBe('MONTHLY');
          expect(res.body.active).toBe(true);
        });
    });

    it('should get all tax obligations (GET)', () => {
      return request(app.getHttpServer())
        .get('/tax-obligations')
        .set('Authorization', `Bearer ${authToken}`)
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
      return request(app.getHttpServer())
        .post('/organizations')
        .send({
          name: 'Test Corporation Ltd',
          tin: '123456789012',
          category: "NON_INDIVIDUAL",
          subcategory: "CORPORATION",
          tax_classification: "VAT",
          registration_date: '2024-01-01',
          address: '123 Test Street, Test City',
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
      return request(app.getHttpServer())
        .get(`/organizations/${createdOrgId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdOrgId);
          expect(res.body.name).toBe('Test Corporation Ltd');
          expect(res.body.tin).toBe('123456789012');
        });
    });

    it('should update organization (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/organizations/${createdOrgId}`)
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
      return request(app.getHttpServer())
        .get('/organizations')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('should get organization operation (GET)', () => {
      return request(app.getHttpServer())
        .get(`/organizations/${createdOrgId}/operation`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('organization_id');
          expect(res.body.organization_id).toBe(createdOrgId);
          expect(res.body).toHaveProperty('accounting_method');
          expect(res.body).toHaveProperty('has_employees');
        });
    });

    it('should update organization operation (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/organizations/${createdOrgId}/operation`)
        .send({
          has_employees: true,
          has_foreign: true,
          accounting_method: "ACCRUAL",
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

    describe('/organizations/:orgId/obligations', () => {
      let taxObligationId: string;

      beforeAll(async () => {
        // Create a tax obligation for testing
        const taxObligation = await prisma.taxObligation.create({
          data: {
            code: 'INCOME_TAX_001',
            name: 'Annual Income Tax',
            frequency: "ANNUAL",
            due_rule: { month: 4, day: 15 },
            active: true,
          },
        });
        taxObligationId = taxObligation.id;
      });

      it('should assign obligation to organization (POST)', () => {
        return request(app.getHttpServer())
          .post(`/organizations/${createdOrgId}/obligations`)
          .send({
            obligation_id: taxObligationId,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            status: "ACTIVE",
            notes: 'Annual income tax filing',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.organization_id).toBe(createdOrgId);
            expect(res.body.obligation_id).toBe(taxObligationId);
            expect(res.body.status).toBe('ACTIVE');
            expect(res.body.notes).toBe('Annual income tax filing');
          });
      });

      it('should get organization obligations (GET)', () => {
        return request(app.getHttpServer())
          .get(`/organizations/${createdOrgId}/obligations`)
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
        return request(app.getHttpServer())
          .get(`/organizations/${createdOrgId}/schedules`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            // May be empty if no schedules exist yet
            if (res.body.length > 0) {
              expect(res.body[0]).toHaveProperty('id');
              expect(res.body[0]).toHaveProperty('org_obligation_id');
              expect(res.body[0]).toHaveProperty('period');
              expect(res.body[0]).toHaveProperty('status');
            }
          });
      });
    });

    it('should soft delete organization (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/organizations/${createdOrgId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdOrgId);
          expect(res.body.deleted_at).toBeTruthy();
        });
    });

    it('should not find deleted organization (GET)', () => {
      return request(app.getHttpServer())
        .get(`/organizations/${createdOrgId}`)
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent organization', () => {
      return request(app.getHttpServer())
        .get('/organizations/non-existent-id')
        .expect(404);
    });

    it('should return 400 for invalid organization data', () => {
      return request(app.getHttpServer())
        .post('/organizations')
        .send({
          name: '', // Invalid: empty name
          category: 'INVALID_CATEGORY',
        })
        .expect(400);
    });

    it('should return 400 for duplicate tax obligation code', () => {
      return request(app.getHttpServer())
        .post('/tax-obligations')
        .send({
          code: 'VAT_MONTHLY_001', // Already exists from previous test
          name: 'Duplicate VAT Filing',
          frequency: "MONTHLY",
          due_rule: { day: 20 },
          active: true,
        })
        .expect(400);
    });
  });

  describe('API Documentation', () => {
    it('should serve Swagger documentation at /api', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain('swagger');
          expect(res.text).toContain('Organization Management API');
        });
    });

    it('should serve Swagger JSON at /api-json', () => {
      return request(app.getHttpServer())
        .get('/api-json')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('paths');
          expect(res.body.info.title).toBe('Organization Management API');
        });
    });
  });
});
