/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { OrganizationService } from '../services/organization.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { BusinessStatus, OrganizationStatusChangeReasonEnum } from '@prisma/client';

/* eslint-disable @typescript-eslint/unbound-method */

describe('Organization Status Change Reason (Step 4)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<OrganizationService>;

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

    describe('PUT /organizations/:orgId/status', () => {
      it('should update organization status and create change reason record', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: OrganizationStatusChangeReasonEnum.EXPIRED,
          description:
            'Approving organization after initial setup verification',
        };

        // Mock status update service call
        mockService.updateStatus.mockResolvedValue(mockUpdatedStatus);

        const token = signPayload(
          {
            userId: 'user-123',
            username: 'user123@example.com',
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
          reason: OrganizationStatusChangeReasonEnum.OPTED_OUT,
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
            username: 'user123@example.com',
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
            username: 'user123@example.com',
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

      it('should update organization status with APPROVED reason', async () => {
        const updateData = {
          status: BusinessStatus.REGISTERED,
          reason: OrganizationStatusChangeReasonEnum.APPROVED,
          description: 'Organization approved for registration',
        };

        // Mock status update service call
        const mockApprovedStatus = {
          ...mockOrganizationStatus,
          status: BusinessStatus.REGISTERED,
        };
        mockService.updateStatus.mockResolvedValue(mockApprovedStatus);

        const token = signPayload(
          {
            userId: 'user-123',
            username: 'user123@example.com',
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
        expect(res.body).toHaveProperty('status', BusinessStatus.REGISTERED);
        expect(mockService.updateStatus).toHaveBeenCalledWith(
          '1',
          updateData,
          'user-123',
        );
      });

      it('should update organization status with REMOVED reason', async () => {
        const updateData = {
          status: BusinessStatus.INACTIVE,
          reason: OrganizationStatusChangeReasonEnum.REMOVED,
          description: 'Organization removed from active status',
        };

        // Mock status update service call
        const mockRemovedStatus = {
          ...mockOrganizationStatus,
          status: BusinessStatus.INACTIVE,
        };
        mockService.updateStatus.mockResolvedValue(mockRemovedStatus);

        const token = signPayload(
          {
            userId: 'user-123',
            username: 'user123@example.com',
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
        expect(res.body).toHaveProperty('status', BusinessStatus.INACTIVE);
        expect(mockService.updateStatus).toHaveBeenCalledWith(
          '1',
          updateData,
          'user-123',
        );
      });

      it('should allow SUPERADMIN to update organization status without specific permissions', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: OrganizationStatusChangeReasonEnum.APPROVED,
          description: 'SUPERADMIN updating status',
        };

        // Mock status update service call
        mockService.updateStatus.mockResolvedValue(mockUpdatedStatus);

        const token = signPayload(
          {
            userId: 'super-admin-123',
            username: 'superadmin@example.com',
            isSuperAdmin: true,
            permissions: ['*'], // SUPERADMIN has wildcard permission
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', BusinessStatus.ACTIVE);
        expect(mockService.updateStatus).toHaveBeenCalledWith(
          '1',
          updateData,
          'super-admin-123',
        );
      });

      it('should allow SUPERADMIN with role string to update organization status', async () => {
        const updateData = {
          status: BusinessStatus.CLOSED,
          reason: OrganizationStatusChangeReasonEnum.REMOVED,
          description: 'SUPERADMIN with role string updating status',
        };

        // Mock status update service call
        const mockClosedStatus = {
          ...mockOrganizationStatus,
          status: BusinessStatus.CLOSED,
        };
        mockService.updateStatus.mockResolvedValue(mockClosedStatus);

        const token = signPayload(
          {
            userId: 'super-admin-role-123',
            username: 'superadminrole@example.com',
            isSuperAdmin: false, // Not using boolean, but role string
            role: 'Super Admin',
            permissions: [],
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
          'super-admin-role-123',
        );
      });

      it('should allow user with wildcard permission to update organization status', async () => {
        const updateData = {
          status: BusinessStatus.REGISTERED,
          reason: OrganizationStatusChangeReasonEnum.APPROVED,
          description: 'User with wildcard permission updating status',
        };

        // Mock status update service call
        const mockRegisteredStatus = {
          ...mockOrganizationStatus,
          status: BusinessStatus.REGISTERED,
        };
        mockService.updateStatus.mockResolvedValue(mockRegisteredStatus);

        const token = signPayload(
          {
            userId: 'wildcard-user-123',
            username: 'wildcard@example.com',
            isSuperAdmin: false,
            permissions: ['*'], // Wildcard permission
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', BusinessStatus.REGISTERED);
        expect(mockService.updateStatus).toHaveBeenCalledWith(
          '1',
          updateData,
          'wildcard-user-123',
        );
      });

      it('should reject user with incorrect SUPERADMIN role string', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: OrganizationStatusChangeReasonEnum.EXPIRED,
        };

        const token = signPayload(
          {
            userId: 'wrong-role-user-123',
            username: 'wrongrole@example.com',
            isSuperAdmin: false,
            role: 'SUPERADMIN', // Wrong case, should be 'Super Admin'
            permissions: [],
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(403); // Forbidden due to insufficient permissions
      });

      it('should reject non-SUPERADMIN users without proper permissions', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: OrganizationStatusChangeReasonEnum.EXPIRED,
        };

        const token = signPayload(
          {
            userId: 'regular-user-123',
            username: 'regular@example.com',
            isSuperAdmin: false,
            permissions: [], // No permissions
          },
          process.env.JWT_SECRET!,
        );
        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.status).toBe(403); // Forbidden due to insufficient permissions
      });

      it('should reject invalid JWT tokens', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: OrganizationStatusChangeReasonEnum.EXPIRED,
        };

        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .set('Authorization', 'Bearer invalid-token')
          .send(updateData);

        expect(res.status).toBe(401); // Unauthorized due to invalid token
      });

      it('should reject requests without Authorization header', async () => {
        const updateData = {
          status: BusinessStatus.ACTIVE,
          reason: OrganizationStatusChangeReasonEnum.EXPIRED,
        };

        const res = await request(app.getHttpServer())
          .put('/api/org/organizations/1/status')
          .send(updateData);

        expect(res.status).toBe(401); // Unauthorized due to missing token
      });
    });

    describe('PATCH /organizations/:orgId/status', () => {
      it('should partially update organization status and create change reason record', async () => {
        const updateData = {
          status: BusinessStatus.SUSPENDED,
          reason: OrganizationStatusChangeReasonEnum.PAYMENT_PENDING,
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
            username: 'user123@example.com',
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
