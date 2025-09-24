import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { signPayload } from '../../test-utils/token';
import { OrganizationService } from '../../modules/organizations/services/organization.service';
import { Category, TaxClassification } from '../../../generated/prisma';
import { PrismaService } from '../../database/prisma.service';

describe('Organization Business Operations (Step 6.6)', () => {
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
                status: 'PENDING',
                last_update: now,
                created_at: now,
                updated_at: now,
              },
              operation: {
                id: 'operation-1',
                organization_id: '1',
                fy_start: new Date('2025-01-01'),
                fy_end: new Date('2025-12-31'),
                vat_reg_effectivity: new Date('2025-01-01'),
                registration_effectivity: new Date('2025-01-01'),
                payroll_cut_off: ['15/30'],
                payment_cut_off: ['15/30'],
                quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
                has_foreign: false,
                accounting_method: 'ACCRUAL',
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
                status: 'PENDING',
                last_update: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
              },
              operation: {
                id: 'operation-1',
                organization_id: '1',
                fy_start: new Date('2025-01-01'),
                fy_end: new Date('2025-12-31'),
                vat_reg_effectivity: new Date('2025-01-01'),
                registration_effectivity: new Date('2025-01-01'),
                payroll_cut_off: ['15/30'],
                payment_cut_off: ['15/30'],
                quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
                has_foreign: false,
                accounting_method: 'ACCRUAL',
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
                status: 'PENDING',
                last_update: now,
                created_at: new Date(),
                updated_at: now,
              },
              operation: {
                id: 'operation-1',
                organization_id: '1',
                fy_start: new Date('2025-01-01'),
                fy_end: new Date('2025-12-31'),
                vat_reg_effectivity: new Date('2025-01-01'),
                registration_effectivity: new Date('2025-01-01'),
                payroll_cut_off: ['15/30'],
                payment_cut_off: ['15/30'],
                quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
                has_foreign: false,
                accounting_method: 'ACCRUAL',
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
                status: 'PENDING',
                last_update: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
              },
              operation: {
                id: 'operation-1',
                organization_id: '1',
                fy_start: new Date('2025-01-01'),
                fy_end: new Date('2025-12-31'),
                vat_reg_effectivity: new Date('2025-01-01'),
                registration_effectivity: new Date('2025-01-01'),
                payroll_cut_off: ['15/30'],
                payment_cut_off: ['15/30'],
                quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
                has_foreign: false,
                accounting_method: 'ACCRUAL',
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
        organizationOperation: {
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn(),
          upsert: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Organization Operation CRUD', () => {
    it('should create organization operation automatically when organization is created', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:create'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const payload = { name: 'Test Org', category: 'NON_INDIVIDUAL', tax_classification: 'VAT' };

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('operation');
      expect(res.body.operation).toHaveProperty('fy_start');
      expect(res.body.operation).toHaveProperty('fy_end');
      expect(res.body.operation).toHaveProperty('vat_reg_effectivity');
      expect(res.body.operation).toHaveProperty('registration_effectivity');
      expect(res.body.operation).toHaveProperty('payroll_cut_off');
      expect(res.body.operation).toHaveProperty('payment_cut_off');
      expect(res.body.operation).toHaveProperty('quarter_closing');
      expect(res.body.operation).toHaveProperty('has_foreign', false);
      expect(res.body.operation).toHaveProperty('accounting_method');
      expect(res.body.operation).toHaveProperty('organization_id', res.body.id);
    });

    it('should return organization with operation when getting organization by id', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('operation');
      expect(res.body.operation).toHaveProperty('fy_start');
      expect(res.body.operation).toHaveProperty('fy_end');
      expect(res.body.operation).toHaveProperty('payroll_cut_off');
      expect(res.body.operation).toHaveProperty('quarter_closing');
      expect(Array.isArray(res.body.operation.quarter_closing)).toBe(true);
      expect(res.body.operation.quarter_closing).toHaveLength(4);
    });

    it('should return organizations with operation when listing organizations', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('operation');
      expect(res.body[0].operation).toHaveProperty('has_foreign', false);
      expect(res.body[0].operation).toHaveProperty('accounting_method', 'ACCRUAL');
    });

    it('should update organization operation last_update when organization is updated', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .put('/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Org' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('operation');
      expect(res.body.operation).toHaveProperty('last_update');
    });
  });

  describe('Organization Operation Permissions', () => {
    it('should deny access to organization operation without proper read permission', async () => {
      const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should allow super admin to access organization operation', async () => {
      const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: true, role: 'Super Admin' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('operation');
    });
  });

  describe('Organization Operation Edge Cases', () => {
    it('should create operation with default values for INDIVIDUAL category organizations', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:create'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const payload = { name: 'Individual Org', category: 'INDIVIDUAL', tax_classification: 'NON_VAT' };

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('operation');
      expect(res.body.operation).toHaveProperty('has_foreign', false);
      expect(res.body.category).toBe('INDIVIDUAL');
    });

    it('should handle operation data with nullable fields', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('operation');
      // These fields can be nullable
      expect(res.body.operation).toHaveProperty('payroll_cut_off');
      expect(res.body.operation).toHaveProperty('payment_cut_off');
      expect(res.body.operation).toHaveProperty('accounting_method');
    });

    it('should maintain operation organization_id relationship', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('operation');
      expect(res.body.operation).toHaveProperty('organization_id', '1');
      expect(res.body.id).toBe(res.body.operation.organization_id);
    });

    it('should handle multiple organizations with different operation data in list', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

      // Mock multiple organizations with different operations
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
            status: 'PENDING',
            last_update: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
          operation: {
            id: 'operation-1',
            organization_id: '1',
            fy_start: new Date('2025-01-01'),
            fy_end: new Date('2025-12-31'),
            vat_reg_effectivity: new Date('2025-01-01'),
            registration_effectivity: new Date('2025-01-01'),
            payroll_cut_off: ['15/30'],
            payment_cut_off: ['15/30'],
            quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
            has_foreign: false,
            accounting_method: 'CASH',
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
            status: 'PENDING',
            last_update: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
          operation: {
            id: 'operation-2',
            organization_id: '2',
            fy_start: new Date('2025-04-01'),
            fy_end: new Date('2026-03-31'),
            vat_reg_effectivity: new Date('2025-04-01'),
            registration_effectivity: new Date('2025-04-01'),
            payroll_cut_off: ['25/10'],
            payment_cut_off: ['25/10'],
            quarter_closing: ['06/30', '09/30', '12/31', '03/31'],
            has_foreign: true,
            accounting_method: 'ACCRUAL',
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
      expect(res.body[0]).toHaveProperty('operation');
      expect(res.body[1]).toHaveProperty('operation');
      expect(res.body[0].operation.organization_id).toBe(res.body[0].id);
      expect(res.body[1].operation.organization_id).toBe(res.body[1].id);
      expect(res.body[0].operation.accounting_method).toBe('CASH');
      expect(res.body[1].operation.accounting_method).toBe('ACCRUAL');
      expect(res.body[0].operation.has_foreign).toBe(false);
      expect(res.body[1].operation.has_foreign).toBe(true);
    });
  });

  describe('Organization Operation Error Handling', () => {
    it('should handle database errors during organization creation with operation', async () => {
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

    it('should handle database errors during organization update with operation', async () => {
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
