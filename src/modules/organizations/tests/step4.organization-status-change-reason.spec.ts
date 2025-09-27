import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { OrganizationService } from '../services/organization.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { BusinessStatus } from '@prisma/client';

describe('Organization Status Change Reason (Step 4)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<OrganizationService>;
  let mockRepository: jest.Mocked<OrganizationRepository>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrganizationService)
      .useValue({
        updateStatus: jest.fn(),
        getStatusByOrgId: jest.fn(),
      })
      .overrideProvider(OrganizationRepository)
      .useValue({
        updateStatus: jest.fn(),
        getStatusByOrgId: jest.fn(),
        createStatusChangeReason: jest.fn(),
        getStatusChangeReasonsByOrgId: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/org');
    await app.init();

    mockService = moduleFixture.get(OrganizationService);
    mockRepository = moduleFixture.get(OrganizationRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Organization Status Updates with Reason Tracking', () => {
    const mockOrganizationStatus = {
      id: 'status-1',
      organization_id: '1',
      status: BusinessStatus.PENDING_REG,
      last_update: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const mockUpdatedStatus = {
      ...mockOrganizationStatus,
      status: BusinessStatus.ACTIVE,
      last_update: new Date(),
    };

    const mockStatusChangeReason = {
      id: 'reason-1',
      organization_id: '1',
      reason: 'EXPIRED',
      description: 'Approving organization after initial setup verification',
      update_date: new Date(),
      updated_by: 'user-123',
    };

    describe('PUT /organizations/:orgId/status', () => {
      it('should update organization status and create change reason record', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: 'EXPIRED',
          description:
            'Approving organization after initial setup verification',
        };

        // Mock status update service call
        mockService.updateStatus.mockResolvedValue(mockUpdatedStatus);

        const token = signPayload(
          {
            userId: 'user-123',
            permissions: ['resource:update'],
            isSuperAdmin: false,
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', BusinessStatus.ACTIVE);
        expect(res.body).toHaveProperty('organization_id', '1');
        expect(mockService.updateStatus).toHaveBeenCalledWith(
          '1',
          updateData,
          'user-123',
        );
      });

      it('should update organization status with reason but no description', async () => {
        const updateData = {
          status: BusinessStatus.CLOSED,
          reason: 'OPTED_OUT',
        };

        // Mock status update service call
        const mockRejectedStatus = {
          ...mockOrganizationStatus,
          status: BusinessStatus.CLOSED,
        };
        mockService.updateStatus.mockResolvedValue(mockRejectedStatus);

        const token = signPayload(
          {
            userId: 'user-123',
            permissions: ['resource:update'],
            isSuperAdmin: false,
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', BusinessStatus.CLOSED);
        expect(mockService.updateStatus).toHaveBeenCalledWith(
          '1',
          updateData,
          'user-123',
        );
      });

      it('should return 400 when reason is missing', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          // reason is missing - should fail validation
        };

        const token = signPayload(
          {
            userId: 'user-123',
            permissions: ['resource:update'],
            isSuperAdmin: false,
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(400);
      });

      it('should return 400 when reason is invalid', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: 'INVALID_REASON', // Not in allowed enum values
          description: 'Test description',
        };

        const token = signPayload(
          {
            userId: 'user-123',
            permissions: ['resource:update'],
            isSuperAdmin: false,
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(400);
      });
    });

    describe('PATCH /organizations/:orgId/status', () => {
      it('should partially update organization status and create change reason record', async () => {
        const updateData = {
          status: BusinessStatus.SUSPENDED,
          reason: 'PAYMENT_PENDING',
          description: 'Temporarily suspending due to business restructuring',
        };

        // Mock status update service call
        const mockSuspendedStatus = {
          ...mockOrganizationStatus,
          status: BusinessStatus.SUSPENDED,
        };
        mockService.updateStatus.mockResolvedValue(mockSuspendedStatus);

        const token = signPayload(
          {
            userId: 'user-123',
            permissions: ['resource:update'],
            isSuperAdmin: false,
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .patch('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', BusinessStatus.SUSPENDED);
        expect(mockService.updateStatus).toHaveBeenCalledWith(
          '1',
          updateData,
          'user-123',
        );
      });
    });
  });
});
