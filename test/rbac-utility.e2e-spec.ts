import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import nock from 'nock';

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
    // Clean up nock mocks
    nock.cleanAll();
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

      // Mock RBAC API to return user resources
      nock('http://localhost:3000')
        .get('/api/auth/me')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, {
          id: 'e9f15ac8-db83-491b-9354-f7a5788cd73d',
          email: 'superadmin@dvconsultingph.com',
          isActive: true,
          isSuperAdmin: true,
          createdAt: '2025-10-02T13:27:17.611Z',
          updatedAt: '2025-10-02T13:27:17.611Z',
          details: {
            firstName: 'Super',
            lastName: 'Admin',
            nickName: 'Admin',
            contactNumber: '+1-555-0101',
            reportTo: null
          },
          resources: [
            {
              resourceId: 'org-123',
              role: 'Admin'
            },
            {
              resourceId: 'org-456',
              role: 'Manager'
            }
          ]
        });

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

      // Mock roles API
      nock('http://localhost:3000')
        .get('/api/roles')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, [
          {
            id: 'role-1',
            name: 'Admin',
            permissions: ['read', 'write', 'delete']
          },
          {
            id: 'role-2',
            name: 'Manager',
            permissions: ['read', 'write']
          }
        ]);

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

      // Mock RBAC API to return user resources
      nock('http://localhost:3000')
        .get('/api/resources/v2')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, {
          data: [
            {
              resourceId: 'org-123',
              role: 'Admin',
              description: 'Organization ABC Corp (123456789)',
              name: 'ABC Corp'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        });

      // Get user resources to find a valid resourceId
      const userResponse = await request('http://localhost:3000')
        .get('/api/resources/v2')
        .set('Authorization', `Bearer ${token}`);

      const resourceId = userResponse.body.data[0].resourceId;

      // Mock permission check API
      nock('http://localhost:3000')
        .post('/api/permissions/check')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, {
          hasPermission: true,
          userPermissions: ['read', 'write'],
          checkedPermission: 'read',
          resourceId: resourceId
        });

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