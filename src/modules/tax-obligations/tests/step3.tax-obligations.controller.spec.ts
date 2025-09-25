import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { TaxObligationService } from '../services/tax-obligation.service';
import { PrismaService } from '../../../database/prisma.service';

describe('TaxObligations Controller (e2e)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<TaxObligationService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TaxObligationService)
      .useValue({
        create: jest.fn(),
        listActive: jest.fn(),
      })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        taxObligation: {
          create: jest.fn(),
          findMany: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    mockService = moduleFixture.get(TaxObligationService);
  });

  it('POST /tax-obligations without JWT -> 401', async () => {
    const res = await request(app.getHttpServer()).post('/tax-obligations').send({ code: '2550M', name: 'Monthly VAT', frequency: 'MONTHLY', due_rule: { day: 20 } });
    expect(res.status).toBe(401);
  });

  it('POST /tax-obligations with JWT but lacking permission -> 403', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
    const res = await request(app.getHttpServer()).post('/tax-obligations').set('Authorization', `Bearer ${token}`).send({ code: '2550M', name: 'Monthly VAT', frequency: 'MONTHLY', due_rule: { day: 20 } });
    expect(res.status).toBe(403);
  });

  it('Admin user can POST /tax-obligations to create a new obligation', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['tax:configure'], isSuperAdmin: false, role: 'User' }, process.env.JWT_SECRET!);
    const payload = { code: '2550M', name: 'Monthly VAT', frequency: 'MONTHLY', due_rule: { day: 20 } };
    const mockObligation = { id: '1', code: '2550M', name: 'Monthly VAT', frequency: 'MONTHLY' as const, due_rule: { day: 20 }, active: true, created_at: new Date(), updated_at: new Date() };
    mockService.create.mockResolvedValue(mockObligation);
    const res = await request(app.getHttpServer()).post('/tax-obligations').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: '1', code: '2550M', name: 'Monthly VAT', frequency: 'MONTHLY' });
  });

  it('GET /tax-obligations returns active obligations by default', async () => {
    const mockObligations = [
      { id: '1', code: '2550M', name: 'Monthly VAT', frequency: 'MONTHLY' as const, due_rule: { day: 20 }, active: true, created_at: new Date(), updated_at: new Date() },
    ];
    mockService.listActive.mockResolvedValue(mockObligations);
    const res = await request(app.getHttpServer()).get('/tax-obligations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: '1', code: '2550M', name: 'Monthly VAT' });
  });

  it('GET /tax-obligations returns empty array when no active obligations', async () => {
    mockService.listActive.mockResolvedValue([]);
    const res = await request(app.getHttpServer()).get('/tax-obligations');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('superAdmin can create tax obligations without specific permissions', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: true, role: 'Super Admin' }, process.env.JWT_SECRET!);
    const payload = { code: '1701', name: 'Annual Income Tax', frequency: 'ANNUAL', due_rule: { month: 4, day: 15 } };
    const mockObligation = { id: '2', code: '1701', name: 'Annual Income Tax', frequency: 'ANNUAL' as const, due_rule: { month: 4, day: 15 }, active: true, created_at: new Date(), updated_at: new Date() };
    mockService.create.mockResolvedValue(mockObligation);
    const res = await request(app.getHttpServer()).post('/tax-obligations').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: '2', code: '1701', name: 'Annual Income Tax' });
  });

  it('POST /tax-obligations with malformed JWT returns 401', async () => {
    const res = await request(app.getHttpServer()).post('/tax-obligations').set('Authorization', 'Bearer invalid.jwt.token').send({ code: '2550M', name: 'Monthly VAT', frequency: 'MONTHLY', due_rule: { day: 20 } });
    expect(res.status).toBe(401);
  });
});
