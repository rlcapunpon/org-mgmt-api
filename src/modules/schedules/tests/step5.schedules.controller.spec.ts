import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { SchedulesService } from '../services/schedules.service';
import { SchedulesRepository } from '../repositories/schedules.repository';
import { PrismaService } from '../../../database/prisma.service';
import { ScheduleStatus } from '../../../../generated/prisma';

describe('Schedules Controller (e2e)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<SchedulesService>;
  let mockRepository: jest.Mocked<SchedulesRepository>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SchedulesService)
      .useValue({
        generateSchedulesForObligation: jest.fn(),
      })
      .overrideProvider(SchedulesRepository)
      .useValue({
        getOrganizationObligationsWithTaxObligations: jest.fn(),
      })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    mockService = moduleFixture.get(SchedulesService);
    mockRepository = moduleFixture.get(SchedulesRepository);
  });

  it('GET /organizations/:id/schedules without JWT -> 401', async () => {
    const res = await request(app.getHttpServer()).get('/organizations/1/schedules');
    expect(res.status).toBe(401);
  });

  it('GET /organizations/:id/schedules with JWT but lacking permission -> 403', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const res = await request(app.getHttpServer()).get('/organizations/1/schedules').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('GET /organizations/:id/schedules returns schedules when authorized', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.read:org1'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    const mockObligations = [
      {
        id: 'obl1',
        organization_id: 'org1',
        obligation_id: 'tax1',
        start_date: new Date(),
        end_date: null,
        status: 'ACTIVE' as any,
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
        obligation: {
          id: 'tax1',
          name: 'VAT Return',
          frequency: 'monthly',
          due_rule: '15th of month',
          category: 'TAX' as any,
          subcategory: 'VAT' as any,
          created_at: new Date(),
          updated_at: new Date(),
        },
      },
    ];
    const mockSchedules = [
      {
        org_obligation_id: 'obl1',
        period: '2024-01',
        due_date: new Date('2024-01-15'),
        status: ScheduleStatus.DUE,
        filed_at: null,
      },
    ];

    mockRepository.getOrganizationObligationsWithTaxObligations.mockResolvedValue(mockObligations);
    mockService.generateSchedulesForObligation.mockReturnValue(mockSchedules);

    const res = await request(app.getHttpServer())
      .get('/organizations/org1/schedules?start_date=2024-01-01&end_date=2024-12-31')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      org_obligation_id: 'obl1',
      period: '2024-01',
      due_date: '2024-01-15T00:00:00.000Z',
      status: 'DUE',
      filed_at: null,
    });
  });

  it('GET /organizations/:id/schedules uses default dates when not provided', async () => {
    const token = signPayload({ userId: 'u1', permissions: ['organization.read:org1'], isSuperAdmin: false }, process.env.JWT_SECRET!);
    mockRepository.getOrganizationObligationsWithTaxObligations.mockResolvedValue([]);
    mockService.generateSchedulesForObligation.mockReturnValue([]);

    const res = await request(app.getHttpServer())
      .get('/organizations/org1/schedules')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(mockRepository.getOrganizationObligationsWithTaxObligations).toHaveBeenCalledWith('org1');
  });

  it('superAdmin can access schedules endpoint without specific permissions', async () => {
    const token = signPayload({ userId: 'u1', permissions: [], isSuperAdmin: true }, process.env.JWT_SECRET!);
    mockRepository.getOrganizationObligationsWithTaxObligations.mockResolvedValue([]);
    mockService.generateSchedulesForObligation.mockReturnValue([]);

    const res = await request(app.getHttpServer())
      .get('/organizations/org1/schedules')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});