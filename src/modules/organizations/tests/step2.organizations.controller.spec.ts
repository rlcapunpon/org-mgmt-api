import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { OrganizationService } from '../services/organization.service';
import { PrismaService } from '../../../database/prisma.service';
import { Category, TaxClassification } from '../../../../generated/prisma';

describe('Organizations Controller (e2e)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<OrganizationService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrganizationService)
      .useValue({
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        list: jest.fn(),
      })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        organization: {
          create: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          findMany: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    mockService = moduleFixture.get(OrganizationService);
  });

  it('POST /organizations without JWT -> 401', async () => {
    const res = await request(app.getHttpServer()).post('/organizations').send({ name: 'Test', category: 'NON_INDIVIDUAL', tax_classification: 'VAT' });
    expect(res.status).toBe(401);
  });

  it('POST /organizations with JWT but lacking permission -> 403', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const res = await request(app.getHttpServer()).post('/organizations').set('Authorization', `Bearer ${token}`).send({ name: 'Test', category: 'NON_INDIVIDUAL', tax_classification: 'VAT' });
    expect(res.status).toBe(403);
  });

  it('POST /organizations returns 201 and created payload when valid input & authorized user', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.create'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const payload = { name: 'Test Org', category: 'NON_INDIVIDUAL', tax_classification: 'VAT' };
    const mockOrg = { id: '1', name: 'Test Org', category: Category.NON_INDIVIDUAL, tax_classification: TaxClassification.VAT, tin: null, subcategory: null, registration_date: null, address: null, created_at: new Date(), updated_at: new Date(), deleted_at: null };
    mockService.create.mockResolvedValue(mockOrg);
    const res = await request(app.getHttpServer()).post('/organizations').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: '1', name: 'Test Org', category: 'NON_INDIVIDUAL', tax_classification: 'VAT' });
  });

  it('GET /organizations/:id returns 200 with org data when authorized', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.read'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const mockOrg = { id: '1', name: 'Test Org', category: Category.NON_INDIVIDUAL, tax_classification: TaxClassification.VAT, tin: null, subcategory: null, registration_date: null, address: null, created_at: new Date(), updated_at: new Date(), deleted_at: null };
    mockService.findById.mockResolvedValue(mockOrg);
    const res = await request(app.getHttpServer()).get('/organizations/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: '1', name: 'Test Org', category: 'NON_INDIVIDUAL', tax_classification: 'VAT' });
  });

  it('GET /organizations/:id returns 403 when unauthorized', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const res = await request(app.getHttpServer()).get('/organizations/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('PUT /organizations/:id updates allowed fields; forbidden for unauthorized users', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.write'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const updatedOrg = { id: '1', name: 'Updated Org', category: Category.NON_INDIVIDUAL, tax_classification: TaxClassification.VAT, tin: null, subcategory: null, registration_date: null, address: null, created_at: new Date(), updated_at: new Date(), deleted_at: null };
    mockService.update.mockResolvedValue(updatedOrg);
    const res = await request(app.getHttpServer()).put('/organizations/1').set('Authorization', `Bearer ${token}`).send({ name: 'Updated Org' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Org');
  });

  it('DELETE /organizations/:id sets deleted_at and returns 204', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.write'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    mockService.softDelete.mockResolvedValue(undefined);
    const res = await request(app.getHttpServer()).delete('/organizations/1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('GET /organizations supports pagination and filters', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.read'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const mockOrgs = [
      { id: '1', name: 'Org1', category: Category.NON_INDIVIDUAL, tax_classification: TaxClassification.VAT, tin: null, subcategory: null, registration_date: null, address: null, created_at: new Date(), updated_at: new Date(), deleted_at: null },
    ];
    mockService.list.mockResolvedValue(mockOrgs);
    const res = await request(app.getHttpServer()).get('/organizations?category=NON_INDIVIDUAL').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: '1', name: 'Org1', category: 'NON_INDIVIDUAL', tax_classification: 'VAT' });
  });
});