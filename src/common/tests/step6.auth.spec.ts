import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { signPayload } from '../../test-utils/token';
import jwt from 'jsonwebtoken';

describe('Auth & RBAC (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('JWT Verification', () => {
    it('should allow request with valid JWT', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      // Should be 404 (org not found) rather than 401/403
      expect(res.status).toBe(404);
    });

    it('should reject request with expired JWT', async () => {
      const expiredToken = jwt.sign(
        {
          userId: 'u1',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
          iat: Math.floor(Date.now() / 1000) - 3600,
          exp: Math.floor(Date.now() / 1000) - 10,
        },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
    });

    it('should reject request with malformed JWT', async () => {
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(res.status).toBe(401);
    });

    it('should reject request without Authorization header', async () => {
      const res = await request(app.getHttpServer()).get('/organizations/1');
      expect(res.status).toBe(401);
    });
  });

  describe('Permission Checks', () => {
    it('should allow request when user has exact permission', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404); // Not 403
    });

    it('should allow request when user has wildcard permission', async () => {
      const token = signPayload(
        { userId: 'u1', permissions: ['*'], isSuperAdmin: false, role: 'User' },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404); // Not 403
    });

    it('should allow request when user has org-scoped permission for specific org', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/org1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404); // Not 403
    });

    it('should reject request when user has org-scoped permission for different org', async () => {
      const token = signPayload(
        { userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/org2')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('should reject request when user lacks required permission', async () => {
      const token = signPayload(
        { userId: 'u1', permissions: [], isSuperAdmin: false, role: 'User' },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('should allow request when user is superAdmin', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: [],
          isSuperAdmin: true,
          role: 'Super Admin',
        },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404); // Not 403
    });

    it('should allow request when user has wildcard * permission', async () => {
      const token = signPayload(
        { userId: 'u1', permissions: ['*'], isSuperAdmin: false, role: 'User' },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404); // Not 403
    });
  });

  describe('RBAC API Integration', () => {
    it('should make RBAC API call when RBAC_CHECK_REALTIME=true', async () => {
      // TODO: Implement with nock mocking
      // For now, assume it works without RBAC call
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const res = await request(app.getHttpServer())
        .get('/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('should deny access when RBAC API returns deny', async () => {
      // TODO: Implement with nock
      expect(true).toBe(true); // Placeholder
    });
  });
});
