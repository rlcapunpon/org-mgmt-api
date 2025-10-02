import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('RbacUtilityService (e2e)', () => {
  let app: INestApplication<App>;

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

  describe('RBAC API Integration', () => {
    it('should authenticate with RBAC API and get JWT token', async () => {
      // Test authentication with RBAC API
      const authResponse = await request('http://localhost:3000')
        .post('/api/auth/login')
        .send({
          email: 'superadmin@dvconsultingph.com',
          password: 'password',
        })
        .expect(200);

      expect(authResponse.body).toHaveProperty('accessToken');
      expect(typeof authResponse.body.accessToken).toBe('string');
      expect(authResponse.body.accessToken.length).toBeGreaterThan(0);
    });

    it('should get user resources from RBAC API', async () => {
      // First get authentication token
      const authResponse = await request('http://localhost:3000')
        .post('/api/auth/login')
        .send({
          email: 'superadmin@dvconsultingph.com',
          password: 'password',
        });

      const token = authResponse.body.accessToken;

      // Test getting user resources
      const userResponse = await request('http://localhost:3000')
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(userResponse.body).toHaveProperty('resources');
      expect(Array.isArray(userResponse.body.resources)).toBe(true);
      expect(userResponse.body.resources.length).toBeGreaterThan(0);

      // Each resource should have resourceId and role
      userResponse.body.resources.forEach((resource: any) => {
        expect(resource).toHaveProperty('resourceId');
        expect(resource).toHaveProperty('role');
        expect(typeof resource.resourceId).toBe('string');
        expect(typeof resource.role).toBe('string');
      });
    });

    it('should get roles from RBAC API', async () => {
      // First get authentication token
      const authResponse = await request('http://localhost:3000')
        .post('/api/auth/login')
        .send({
          email: 'superadmin@dvconsultingph.com',
          password: 'password',
        });

      const token = authResponse.body.accessToken;

      // Test getting roles
      const rolesResponse = await request('http://localhost:3000')
        .get('/api/roles')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(rolesResponse.body)).toBe(true);
      expect(rolesResponse.body.length).toBeGreaterThan(0);

      // Each role should have id, name, and permissions
      rolesResponse.body.forEach((role: any) => {
        expect(role).toHaveProperty('id');
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('permissions');
        expect(Array.isArray(role.permissions)).toBe(true);
      });
    });

    it('should check user permissions via RBAC API', async () => {
      // First get authentication token
      const authResponse = await request('http://localhost:3000')
        .post('/api/auth/login')
        .send({
          email: 'superadmin@dvconsultingph.com',
          password: 'password',
        });

      const token = authResponse.body.accessToken;

      // Get user resources to find a valid resourceId
      const userResponse = await request('http://localhost:3000')
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      const resourceId = userResponse.body.resources[0].resourceId;

      // Test permission check
      const permissionResponse = await request('http://localhost:3000')
        .post('/api/permissions/check')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: 'f2d9c5cd-0c8c-4194-a8ff-3b23f8bdc980', // superadmin userId
          permission: 'read',
          resourceId: resourceId,
        })
        .expect(200);

      expect(permissionResponse.body).toHaveProperty('hasPermission');
      expect(permissionResponse.body).toHaveProperty('userPermissions');
      expect(permissionResponse.body).toHaveProperty('checkedPermission');
      expect(permissionResponse.body).toHaveProperty('resourceId');
      expect(typeof permissionResponse.body.hasPermission).toBe('boolean');
      expect(Array.isArray(permissionResponse.body.userPermissions)).toBe(true);
    });
  });
});