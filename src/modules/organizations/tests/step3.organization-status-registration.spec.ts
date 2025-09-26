import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { OrganizationService } from '../services/organization.service';
import { Category, TaxClassification, BusinessStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

describe('Organization Status and Registration Endpoints (Step 3)', () => {
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
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
        organizationStatus: {
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn().mockImplementation((args) => {
            if (args.where.organization_id === 'non-existent-id') {
              return Promise.resolve(null);
            }
            return Promise.resolve({
              id: 'status-1',
              organization_id: '1',
              status: BusinessStatus.PENDING_REG,
              last_update: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
            });
          }),
        },
        organizationRegistration: {
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn().mockImplementation((args) => {
            if (args.where.organization_id === 'non-existent-id') {
              return Promise.resolve(null);
            }
            return Promise.resolve({
              organization_id: '1',
              first_name: 'John',
              middle_name: null,
              last_name: 'Doe',
              trade_name: null,
              line_of_business: '6201',
              address_line: '123 Main St',
              region: 'NCR',
              city: 'Makati',
              zip_code: '1223',
              tin: '123456789012',
              rdo_code: '001',
              contact_number: '+639123456789',
              email_address: 'john.doe@example.com',
              tax_type: TaxClassification.VAT,
              start_date: new Date('2024-01-01'),
              reg_date: new Date('2024-01-01'),
              update_date: new Date(),
              update_by: 'user-1',
              created_at: new Date(),
              updated_at: new Date(),
            });
          }),
        },
        organizationStatusChangeReason: {
          create: jest.fn(),
          findMany: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Organization Status Endpoints', () => {
    describe('GET /organizations/:orgId/status', () => {
      it('should get organization status by organization id', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

        const res = await request(app.getHttpServer())
          .get('/organizations/1/status')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('organization_id', '1');
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('last_update');
      });

      it('should return 404 for non-existent organization status', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

        const res = await request(app.getHttpServer())
          .get('/organizations/non-existent-id/status')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
      });

      it('should deny access without proper permissions', async () => {
        const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

        const res = await request(app.getHttpServer())
          .get('/organizations/1/status')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
      });
    });

    describe('PUT /organizations/:orgId/status', () => {
      it('should update organization status', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: 'EXPIRED'
        };

        const prismaService = app.get(PrismaService);
        (prismaService.organizationStatus.update as jest.Mock).mockResolvedValueOnce({
          id: 'status-1',
          organization_id: '1',
          status: BusinessStatus.ACTIVE,
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        });

        const res = await request(app.getHttpServer())
          .put('/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', BusinessStatus.ACTIVE);
        expect(res.body).toHaveProperty('organization_id', '1');
      });

      it('should return 404 when updating non-existent organization status', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: 'EXPIRED'
        };

        const prismaService = app.get(PrismaService);
        (prismaService.organizationStatus.update as jest.Mock).mockRejectedValueOnce({ code: 'P2025' });

        const res = await request(app.getHttpServer())
          .put('/organizations/non-existent-id/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(404);
      });

      it('should deny access without proper permissions', async () => {
        const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: 'EXPIRED'
        };

        const res = await request(app.getHttpServer())
          .put('/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(403);
      });
    });

    describe('PATCH /organizations/:orgId/status', () => {
      it('should partially update organization status', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
        const updateData = {
          status: BusinessStatus.CLOSED,
          reason: 'VIOLATIONS'
        };

        const prismaService = app.get(PrismaService);
        (prismaService.organizationStatus.update as jest.Mock).mockResolvedValueOnce({
          id: 'status-1',
          organization_id: '1',
          status: BusinessStatus.CLOSED,
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        });

        const res = await request(app.getHttpServer())
          .patch('/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', BusinessStatus.CLOSED);
      });
    });
  });

  describe('Organization Registration Endpoints', () => {
    describe('GET /organizations/:orgId/registration', () => {
      it('should get organization registration by organization id', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

        const res = await request(app.getHttpServer())
          .get('/organizations/1/registration')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('organization_id', '1');
        expect(res.body).toHaveProperty('first_name');
        expect(res.body).toHaveProperty('last_name');
        expect(res.body).toHaveProperty('email_address');
        expect(res.body).toHaveProperty('tax_type');
      });

      it('should return 404 for non-existent organization registration', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:read'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

        const res = await request(app.getHttpServer())
          .get('/organizations/non-existent-id/registration')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
      });

      it('should deny access without proper permissions', async () => {
        const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);

        const res = await request(app.getHttpServer())
          .get('/organizations/1/registration')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
      });
    });

    describe('PUT /organizations/:orgId/registration', () => {
      it('should update organization registration', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
        const updateData = {
          first_name: 'Jane',
          last_name: 'Smith',
          email_address: 'jane.smith@example.com',
          contact_number: '+639876543210'
        };

        const prismaService = app.get(PrismaService);
        (prismaService.organizationRegistration.update as jest.Mock).mockResolvedValueOnce({
          organization_id: '1',
          first_name: 'Jane',
          middle_name: null,
          last_name: 'Smith',
          trade_name: null,
          line_of_business: '6201',
          address_line: '123 Main St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          tin: '123456789012',
          rdo_code: '001',
          contact_number: '+639876543210',
          email_address: 'jane.smith@example.com',
          tax_type: TaxClassification.VAT,
          start_date: new Date('2024-01-01'),
          reg_date: new Date('2024-01-01'),
          update_date: new Date(),
          update_by: 'user-1',
          created_at: new Date(),
          updated_at: new Date(),
        });

        const res = await request(app.getHttpServer())
          .put('/organizations/1/registration')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('first_name', 'Jane');
        expect(res.body).toHaveProperty('last_name', 'Smith');
        expect(res.body).toHaveProperty('email_address', 'jane.smith@example.com');
        expect(res.body).toHaveProperty('contact_number', '+639876543210');
      });

      it('should return 404 when updating non-existent organization registration', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
        const updateData = {
          first_name: 'Updated Name'
        };

        const prismaService = app.get(PrismaService);
        (prismaService.organizationRegistration.update as jest.Mock).mockRejectedValueOnce({ code: 'P2025' });

        const res = await request(app.getHttpServer())
          .put('/organizations/non-existent-id/registration')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(404);
      });

      it('should deny access without proper permissions', async () => {
        const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
        const updateData = {
          first_name: 'Updated Name'
        };

        const res = await request(app.getHttpServer())
          .put('/organizations/1/registration')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(403);
      });
    });

    describe('PATCH /organizations/:orgId/registration', () => {
      it('should partially update organization registration', async () => {
        const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
        const updateData = {
          contact_number: '+639111111111'
        };

        const prismaService = app.get(PrismaService);
        (prismaService.organizationRegistration.update as jest.Mock).mockResolvedValueOnce({
          organization_id: '1',
          first_name: 'John',
          middle_name: null,
          last_name: 'Doe',
          trade_name: null,
          line_of_business: '6201',
          address_line: '123 Main St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          tin: '123456789012',
          rdo_code: '001',
          contact_number: '+639111111111',
          email_address: 'john.doe@example.com',
          tax_type: TaxClassification.VAT,
          start_date: new Date('2024-01-01'),
          reg_date: new Date('2024-01-01'),
          update_date: new Date(),
          update_by: 'user-1',
          created_at: new Date(),
          updated_at: new Date(),
        });

        const res = await request(app.getHttpServer())
          .patch('/organizations/1/registration')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('contact_number', '+639111111111');
      });
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate status update payload', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const invalidUpdateData = {
        status: 'INVALID_STATUS'
      };

      const res = await request(app.getHttpServer())
        .put('/organizations/1/status')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidUpdateData);

      expect(res.status).toBe(400);
    });

    it('should validate registration update payload', async () => {
      const token = signPayload({ userId: 'u1', permissions: ['resource:update'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
      const invalidUpdateData = {
        email_address: 'invalid-email'
      };

      const res = await request(app.getHttpServer())
        .put('/organizations/1/registration')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidUpdateData);

      expect(res.status).toBe(400);
    });
  });
});