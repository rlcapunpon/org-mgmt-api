import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { signPayload } from '../../test-utils/token';
import { OrganizationService } from '../../modules/organizations/services/organization.service';
import { Category, TaxClassification } from '../../../generated/prisma';
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
          create: jest.fn().mockResolvedValue({
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
            },
          ]),
          update: jest.fn().mockResolvedValue({
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
              last_update: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
            },
          }),
          findUnique: jest.fn().mockResolvedValue({
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
      expect(res.body.status).toHaveProperty('status', 'PENDING');
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
      expect(res.body.status.status).toBe('PENDING');
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
      expect(res.body[0].status.status).toBe('PENDING');
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
});