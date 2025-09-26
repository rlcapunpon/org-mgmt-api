import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { signPayload } from '../../test-utils/token';
import { OrganizationService } from '../../modules/organizations/services/organization.service';
import { Category, TaxClassification, BusinessStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

describe('Organization Status (Step 6.5)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        organization: {
          create: jest.fn().mockImplementation((args) => {
            const now = new Date();
            return Promise.resolve({
              id: '1',
              name: args.data.name,
              category: args.data.category,
              tax_classification: args.data.tax_classification,
              tin: null,
              subcategory: null,
              registration_date: null,
              address: null,
              created_at: now,
              updated_at: now,
              deleted_at: null,
              status: {
                id: 'status-1',
                organization_id: '1',
                status: BusinessStatus.PENDING_REG,
                last_update: now,
                created_at: now,
                updated_at: now,
              },
            });
          }),
          findMany: jest.fn().mockResolvedValue([
            {
              id: '1',
              name: 'Test Org',
              category: Category.NON_INDIVIDUAL,
              tax_classification: TaxClassification.VAT,
              tin: null,
              subcategory: null,
              registration_date: null,
              address: null,
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              status: {
                id: 'status-1',
                organization_id: '1',
                status: BusinessStatus.PENDING_REG,
                last_update: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
              },
            },
          ]),
          update: jest.fn().mockImplementation(() => {
            const now = new Date();
            return Promise.resolve({
              id: '1',
              name: 'Updated Org',
              category: Category.NON_INDIVIDUAL,
              tax_classification: TaxClassification.VAT,
              tin: null,
              subcategory: null,
              registration_date: null,
              address: null,
              created_at: new Date(),
              updated_at: now,
              deleted_at: null,
              status: {
                id: 'status-1',
                organization_id: '1',
                status: BusinessStatus.PENDING_REG,
                last_update: now,
                created_at: new Date(),
                updated_at: now,
              },
            });
          }),
          findUnique: jest.fn().mockImplementation((args) => {
            if (args.where.id === 'non-existent-id') {
              return Promise.resolve(null);
            }
            return Promise.resolve({
              id: '1',
              name: 'Test Org',
              category: Category.NON_INDIVIDUAL,
              tax_classification: TaxClassification.VAT,
              tin: null,
              subcategory: null,
              registration_date: null,
              address: null,
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              status: {
                id: 'status-1',
                organization_id: '1',
                status: BusinessStatus.PENDING_REG,
                last_update: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
              },
            });
          }),
        },
        organizationStatus: {
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Organization Status CRUD', () => {
    it('should create organization status automatically when organization is created', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:create'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const payload = { name: 'Test Org', category: 'NON_INDIVIDUAL', tax_classification: 'VAT' };
      const mockOrg = {
        id: '1',
        name: 'Test Org',
        category: Category.NON_INDIVIDUAL,
        tax_classification: TaxClassification.VAT,
        tin: null,
        subcategory: null,
        registration_date: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-1',
          organization_id: '1',
          status: 'PENDING',
          last_update: new Date(),
        },
      };

      // mockService.create.mockResolvedValue(mockOrg);
      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toHaveProperty('status', 'PENDING_REG');
      expect(res.body.status).toHaveProperty('organization_id', res.body.id);
    });

    it('should return organization with status when getting organization by id', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const mockOrg = {
        id: '1',
        name: 'Test Org',
        category: Category.NON_INDIVIDUAL,
        tax_classification: TaxClassification.VAT,
        tin: null,
        subcategory: null,
        registration_date: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-1',
          organization_id: '1',
          status: 'PENDING',
          last_update: new Date(),
        },
      };

      // mockService.findById.mockResolvedValue(mockOrg);
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status.status).toBe('PENDING_REG');
    });

    it('should return organizations with status when listing organizations', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const mockOrgs = [
        {
          id: '1',
          name: 'Test Org',
          category: Category.NON_INDIVIDUAL,
          tax_classification: TaxClassification.VAT,
          tin: null,
          subcategory: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          status: {
            id: 'status-1',
            organization_id: '1',
            status: 'PENDING',
            last_update: new Date(),
          },
        },
      ];

      // mockService.list.mockResolvedValue(mockOrgs);
      const res = await request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0].status.status).toBe('PENDING_REG');
      expect(res.body[0]).not.toHaveProperty('operation');
    });

    it('should update organization status last_update when organization is updated', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const updatedOrg = {
        id: '1',
        name: 'Updated Org',
        category: Category.NON_INDIVIDUAL,
        tax_classification: TaxClassification.VAT,
        tin: null,
        subcategory: null,
        registration_date: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-1',
          organization_id: '1',
          status: 'PENDING',
          last_update: new Date(), // Should be updated
        },
      };

      // mockService.update.mockResolvedValue(updatedOrg);
      const res = await request(app.getHttpServer())
        .put('/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Org' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toHaveProperty('last_update');
    });
  });

  describe('Organization Status Permissions', () => {
    it('should deny access to organization status without proper read permission', async () => {
      const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should allow super admin to access organization status', async () => {
      const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: true, role: 'Super Admin' }, process.env.JWT_SECRET!);
      const mockOrg = {
        id: '1',
        name: 'Test Org',
        category: Category.NON_INDIVIDUAL,
        tax_classification: TaxClassification.VAT,
        tin: null,
        subcategory: null,
        registration_date: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-1',
          organization_id: '1',
          status: 'PENDING',
          last_update: new Date(),
        },
      };

      // mockService.findById.mockResolvedValue(mockOrg);
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
    });
  });

  describe('Organization Status Edge Cases', () => {
    it('should create status with PENDING_REG for INDIVIDUAL category organizations', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:create'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const payload = { name: 'Individual Org', category: 'INDIVIDUAL', tax_classification: 'NON_VAT' };

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status.status).toBe('PENDING_REG');
      expect(res.body.category).toBe('INDIVIDUAL');
    });

    it('should return 404 when getting status for non-existent organization', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      // Mock findUnique to return null for non-existent organization
      const prismaService = app.get(PrismaService);
      (prismaService.organization.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app.getHttpServer())
        .get('/organizations/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should maintain status consistency across multiple organization updates', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      // First update
      const res1 = await request(app.getHttpServer())
        .put('/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name 1' });

      expect(res1.status).toBe(200);
      expect(res1.body).toHaveProperty('status');
      const firstUpdateTime = new Date(res1.body.status.last_update);

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second update
      const res2 = await request(app.getHttpServer())
        .put('/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ address: 'New Address' });

      expect(res2.status).toBe(200);
      expect(res2.body).toHaveProperty('status');
      const secondUpdateTime = new Date(res2.body.status.last_update);

      // Second update should have a later timestamp
      expect(secondUpdateTime.getTime()).toBeGreaterThanOrEqual(firstUpdateTime.getTime());
    });

    it('should include status in filtered organization lists', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .get('/organizations?category=NON_INDIVIDUAL')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0].status.status).toBe('PENDING_REG');
      expect(res.body[0].category).toBe('NON_INDIVIDUAL');
    });

    it('should include status in organization lists with tax classification filter', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .get('/organizations?tax_classification=VAT')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0].status.status).toBe('PENDING_REG');
      expect(res.body[0].tax_classification).toBe('VAT');
    });

    it('should create status with proper timestamps on organization creation', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:create'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const payload = { name: 'Timestamp Test Org', category: 'INDIVIDUAL', tax_classification: 'VAT' };
      const beforeCreate = new Date();

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      const afterCreate = new Date();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toHaveProperty('created_at');
      expect(res.body.status).toHaveProperty('updated_at');
      expect(res.body.status).toHaveProperty('last_update');

      const statusCreatedAt = new Date(res.body.status.created_at);
      const statusUpdatedAt = new Date(res.body.status.updated_at);
      const statusLastUpdate = new Date(res.body.status.last_update);

      // Timestamps should be reasonable (within test execution time)
      expect(statusCreatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(statusCreatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(statusUpdatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(statusLastUpdate.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    });

    it('should handle empty organization list with status structure', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      // Mock empty result
      const prismaService = app.get(PrismaService);
      (prismaService.organization.findMany as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app.getHttpServer())
        .get('/organizations?category=NON_INDIVIDUAL&tax_classification=VAT')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('should maintain status organization_id relationship', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toHaveProperty('organization_id', '1');
      expect(res.body.id).toBe(res.body.status.organization_id);
    });

    it('should handle multiple organizations with different statuses in list', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      // Mock multiple organizations without operation data
      const prismaService = app.get(PrismaService);
      (prismaService.organization.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: '1',
          name: 'Org 1',
          category: Category.INDIVIDUAL,
          tax_classification: TaxClassification.VAT,
          tin: null,
          subcategory: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          status: {
            id: 'status-1',
            organization_id: '1',
            status: BusinessStatus.PENDING_REG,
            last_update: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
        {
          id: '2',
          name: 'Org 2',
          category: Category.NON_INDIVIDUAL,
          tax_classification: TaxClassification.NON_VAT,
          tin: null,
          subcategory: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          status: {
            id: 'status-2',
            organization_id: '2',
            status: BusinessStatus.PENDING_REG,
            last_update: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ]);

      const res = await request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[1]).toHaveProperty('status');
      expect(res.body[0].status.organization_id).toBe(res.body[0].id);
      expect(res.body[1].status.organization_id).toBe(res.body[1].id);
      expect(res.body[0].status.status).toBe('PENDING_REG');
      expect(res.body[1].status.status).toBe('PENDING_REG');
      expect(res.body[0]).not.toHaveProperty('operation');
      expect(res.body[1]).not.toHaveProperty('operation');
    });
  });

  describe('Organization Status Error Handling', () => {
    it('should handle database errors during organization creation with status', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:create'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const payload = { name: 'Error Test Org', category: 'INDIVIDUAL', tax_classification: 'VAT' };

      // Mock database error
      const prismaService = app.get(PrismaService);
      (prismaService.organization.create as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(500);
    });

    it('should handle database errors during organization update with status', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      // Mock database error
      const prismaService = app.get(PrismaService);
      (prismaService.organization.update as jest.Mock).mockRejectedValueOnce(new Error('Database update failed'));

      const res = await request(app.getHttpServer())
        .put('/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(500);
    });
  });
});
