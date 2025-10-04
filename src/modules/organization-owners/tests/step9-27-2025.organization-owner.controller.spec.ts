/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { OrganizationOwnerService } from '../services/organization-owner.service';
import { PrismaService } from '../../../database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RbacUtilityService } from '../../../common/services/rbac-utility.service';

describe('Organization Owner Controller (e2e)', () => {
  let app: INestApplication;
  let mockPrismaService: jest.Mocked<PrismaService>;
  let mockRbacService: jest.Mocked<RbacUtilityService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        organizationOwner: {
          create: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
          delete: jest.fn(),
        },
      })
      .overrideProvider(RbacUtilityService)
      .useValue({
        getAvailableRoles: jest.fn(),
        assignRole: jest.fn(),
        revokeRole: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    mockPrismaService = moduleFixture.get(PrismaService);
    mockRbacService = moduleFixture.get(RbacUtilityService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /organizations/:orgId/owners', () => {
    it('should return 401 without JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/organizations/test-org-id/owners')
        .send({ user_id: 'test-user-id' });
      expect(res.status).toBe(401);
    });

    it('should return 403 for non-super-admin users', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:create'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      const res = await request(app.getHttpServer())
        .post('/organizations/test-org-id/owners')
        .set('Authorization', `Bearer ${token}`)
        .send({ user_id: 'test-user-id' });
      expect(res.status).toBe(403);
    });

    it('should assign owner successfully for super admin', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:create'],
          isSuperAdmin: true,
          role: 'Super Admin',
        },
        process.env.JWT_SECRET!,
      );

      const mockOwner = {
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'test-user-id',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      (mockPrismaService.organizationOwner.create as jest.Mock).mockResolvedValue(mockOwner);
      (mockPrismaService.organizationOwner.findUnique as jest.Mock).mockResolvedValue(null); // No existing owner
      mockRbacService.getAvailableRoles.mockResolvedValue([
        { id: 'superadmin-role-id', name: 'SUPERADMIN', description: 'Super Admin Role' }
      ]);
      mockRbacService.assignRole.mockResolvedValue({ message: 'Role assigned successfully' });

      const res = await request(app.getHttpServer())
        .post('/organizations/test-org-id/owners')
        .set('Authorization', `Bearer ${token}`)
        .send({ org_id: 'test-org-id', user_id: 'test-user-id' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'test-user-id',
      });
      expect(mockRbacService.getAvailableRoles).toHaveBeenCalledWith(token);
      expect(mockRbacService.assignRole).toHaveBeenCalledWith('test-user-id', 'superadmin-role-id', 'test-org-id', token);
    });

    it('should return 409 for duplicate owner assignment', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:create'],
          isSuperAdmin: true,
          role: 'Super Admin',
        },
        process.env.JWT_SECRET!,
      );

      const mockOwner = {
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'test-user-id',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      (mockPrismaService.organizationOwner.findUnique as jest.Mock).mockResolvedValue(mockOwner); // Existing owner found

      const res = await request(app.getHttpServer())
        .post('/organizations/test-org-id/owners')
        .set('Authorization', `Bearer ${token}`)
        .send({ org_id: 'test-org-id', user_id: 'test-user-id' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /organizations/:orgId/owners', () => {
    it('should return 401 without JWT', async () => {
      const res = await request(app.getHttpServer()).get(
        '/organizations/test-org-id/owners',
      );
      expect(res.status).toBe(401);
    });

    it('should return 403 for non-super-admin users', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      const res = await request(app.getHttpServer())
        .get('/organizations/test-org-id/owners')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('should return owners list for super admin', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:read'],
          isSuperAdmin: true,
          role: 'Super Admin',
        },
        process.env.JWT_SECRET!,
      );

      const mockOwners = [
        {
          id: 'owner-1',
          org_id: 'test-org-id',
          user_id: 'user-1',
          assigned_date: new Date(),
          last_update: new Date(),
        },
        {
          id: 'owner-2',
          org_id: 'test-org-id',
          user_id: 'user-2',
          assigned_date: new Date(),
          last_update: new Date(),
        },
      ];

      (mockPrismaService.organizationOwner.findMany as jest.Mock).mockResolvedValue(mockOwners);

      const res = await request(app.getHttpServer())
        .get('/organizations/test-org-id/owners')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('owners');
      expect(res.body.owners).toHaveLength(2);
      expect(res.body.owners[0]).toMatchObject({
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'user-1',
      });
    });
  });

  describe('DELETE /organizations/:orgId/owners/:userId', () => {
    it('should return 401 without JWT', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/organizations/test-org-id/owners/test-user-id',
      );
      expect(res.status).toBe(401);
    });

    it('should return 403 for non-super-admin users', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:delete'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      const res = await request(app.getHttpServer())
        .delete('/organizations/test-org-id/owners/test-user-id')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('should remove owner successfully for super admin', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:delete'],
          isSuperAdmin: true,
          role: 'Super Admin',
        },
        process.env.JWT_SECRET!,
      );

      const mockRemovedOwner = {
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'test-user-id',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      (mockPrismaService.organizationOwner.delete as jest.Mock).mockResolvedValue(mockRemovedOwner);
      mockRbacService.getAvailableRoles.mockResolvedValue([
        { id: 'superadmin-role-id', name: 'SUPERADMIN', description: 'Super Admin Role' }
      ]);
      mockRbacService.revokeRole.mockResolvedValue();

      const res = await request(app.getHttpServer())
        .delete('/organizations/test-org-id/owners/test-user-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'test-user-id',
      });
      expect(mockRbacService.getAvailableRoles).toHaveBeenCalledWith(token);
      expect(mockRbacService.revokeRole).toHaveBeenCalledWith('test-user-id', 'superadmin-role-id', 'test-org-id', token);
    });

    it('should return 404 for non-existent owner', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:delete'],
          isSuperAdmin: true,
          role: 'Super Admin',
        },
        process.env.JWT_SECRET!,
      );

      (mockPrismaService.organizationOwner.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });

      const res = await request(app.getHttpServer())
        .delete('/organizations/test-org-id/owners/non-existent-user')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /organizations/owners/:id', () => {
    it('should return 401 without JWT', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/organizations/owners/owner-1',
      );
      expect(res.status).toBe(401);
    });

    it('should return 403 for non-super-admin users', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:delete'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      const res = await request(app.getHttpServer())
        .delete('/organizations/owners/owner-1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('should remove owner by ID successfully for super admin', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:delete'],
          isSuperAdmin: true,
          role: 'Super Admin',
        },
        process.env.JWT_SECRET!,
      );

      const mockRemovedOwner = {
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'test-user-id',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      (mockPrismaService.organizationOwner.delete as jest.Mock).mockResolvedValue(mockRemovedOwner);

      const res = await request(app.getHttpServer())
        .delete('/organizations/owners/owner-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'test-user-id',
      });
    });
  });

  describe('GET /organizations/:orgId/ownership', () => {
    it('should return 401 without JWT', async () => {
      const res = await request(app.getHttpServer()).get(
        '/organizations/test-org-id/ownership',
      );
      expect(res.status).toBe(401);
    });

    it('should return true for super admin users', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:read'],
          isSuperAdmin: true,
          role: 'Super Admin',
        },
        process.env.JWT_SECRET!,
      );

      const res = await request(app.getHttpServer())
        .get('/organizations/test-org-id/ownership')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        is_owner: true,
        org_id: 'test-org-id',
        user_id: 'u1',
      });
    });

    it('should check ownership for regular users', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      (mockPrismaService.organizationOwner.findUnique as jest.Mock).mockResolvedValue({
        id: 'owner-1',
        org_id: 'test-org-id',
        user_id: 'u1',
        assigned_date: new Date(),
        last_update: new Date(),
      });

      const res = await request(app.getHttpServer())
        .get('/organizations/test-org-id/ownership')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        is_owner: true,
        org_id: 'test-org-id',
        user_id: 'u1',
      });
    });

    it('should return false for non-owner users', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          username: 'testuser',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      (mockPrismaService.organizationOwner.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/organizations/test-org-id/ownership')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        is_owner: false,
        org_id: 'test-org-id',
        user_id: 'u1',
      });
    });
  });
});
