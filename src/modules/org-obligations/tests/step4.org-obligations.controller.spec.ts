import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { OrganizationObligationService } from '../services/organization-obligation.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('Organization Obligations Controller (e2e)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<OrganizationObligationService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrganizationObligationService)
      .useValue({
        assignObligation: jest.fn(),
        getObligationsByOrgId: jest.fn(),
        updateStatus: jest.fn(),
        findById: jest.fn(),
      })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        organizationObligation: {
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          findUnique: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    mockService = moduleFixture.get(OrganizationObligationService);
  });

  it('POST /organizations/:id/obligations without JWT -> 401', async () => {
    const res = await request(app.getHttpServer()).post('/organizations/org1/obligations').send({ obligation_id: 'obl1', start_date: '2025-01-01' });
    expect(res.status).toBe(401);
  });

  it('POST /organizations/:id/obligations with JWT but lacking permission -> 403', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const res = await request(app.getHttpServer()).post('/organizations/org1/obligations').set('Authorization', `Bearer ${token}`).send({ obligation_id: 'obl1', start_date: '2025-01-01' });
    expect(res.status).toBe(403);
  });

  it('POST /organizations/:id/obligations assigns an obligation (admin or org-admin only)', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.write'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const payload = { obligation_id: 'obl1', start_date: '2025-01-01', end_date: '2025-12-31', notes: 'Test note' };
    const mockObligation = { id: '1', organization_id: 'org1', obligation_id: 'obl1', start_date: new Date('2025-01-01'), end_date: new Date('2025-12-31'), status: 'ACTIVE' as const, notes: 'Test note', created_at: new Date(), updated_at: new Date() };
    mockService.assignObligation.mockResolvedValue(mockObligation);
    const res = await request(app.getHttpServer()).post('/organizations/org1/obligations').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: '1', organization_id: 'org1', obligation_id: 'obl1' });
  });

  it('GET /organizations/:id/obligations returns 403 when unauthorized', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const res = await request(app.getHttpServer()).get('/organizations/org1/obligations').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('GET /organizations/:id/obligations lists assigned obligations', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.read'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const mockObligations = [
      { id: '1', organization_id: 'org1', obligation_id: 'obl1', start_date: new Date('2025-01-01'), end_date: null, status: 'ACTIVE' as const, notes: null, created_at: new Date(), updated_at: new Date(), obligation: { id: 'obl1', code: '2550M', name: 'Monthly VAT' } },
    ];
    mockService.getObligationsByOrgId.mockResolvedValue(mockObligations);
    const res = await request(app.getHttpServer()).get('/organizations/org1/obligations').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: '1', obligation: { code: '2550M' } });
  });

  it('PUT /organization-obligations/:id updates status (e.g., EXEMPT)', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.write'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const updatedObligation = { id: '1', organization_id: 'org1', obligation_id: 'obl1', start_date: new Date('2025-01-01'), end_date: null, status: 'EXEMPT' as const, notes: null, created_at: new Date(), updated_at: new Date() };
    mockService.updateStatus.mockResolvedValue(updatedObligation);
    const res = await request(app.getHttpServer()).put('/organization-obligations/1').set('Authorization', `Bearer ${token}`).send({ status: 'EXEMPT' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('EXEMPT');
  });

  it('PUT /organization-obligations/:id returns 404 for non-existing obligation', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.write'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    mockService.updateStatus.mockRejectedValue(new NotFoundException());
    const res = await request(app.getHttpServer()).put('/organization-obligations/non-existing').set('Authorization', `Bearer ${token}`).send({ status: 'EXEMPT' });
    expect(res.status).toBe(404);
  });

  it('superAdmin can assign obligations without specific permissions', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: true }, process.env.JWT_SECRET!);
    const payload = { obligation_id: 'obl1', start_date: '2025-01-01' };
    const mockObligation = { id: '2', organization_id: 'org1', obligation_id: 'obl1', start_date: new Date('2025-01-01'), end_date: null, status: 'ACTIVE' as const, notes: null, created_at: new Date(), updated_at: new Date() };
    mockService.assignObligation.mockResolvedValue(mockObligation);
    const res = await request(app.getHttpServer()).post('/organizations/org1/obligations').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: '2', organization_id: 'org1' });
  });
});