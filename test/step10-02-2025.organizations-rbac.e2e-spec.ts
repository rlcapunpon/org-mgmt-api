import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import nock from 'nock';
import { signPayload } from '../src/test-utils/token';

describe('Organizations RBAC Filtering (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    // Ensure JWT_SECRET is set for testing
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get(JwtService);

    // Configure Swagger documentation to match main.ts configuration
    const config = new DocumentBuilder()
      .setTitle('Organization Management API')
      .setDescription(
        'API for managing organizations, tax obligations, and compliance schedules',
      )
      .setVersion('1.0')
      .addTag('Organizations', 'Organization management endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Configure global prefix to match main.ts configuration
    app.setGlobalPrefix('api/org', {
      exclude: [
        { path: 'health', method: RequestMethod.GET },
        { path: 'docs', method: RequestMethod.GET },
        { path: 'docs-json', method: RequestMethod.GET },
      ],
    });

    await app.init();

    // Clean up any existing test data
    await prisma.organizationOperation.deleteMany();
    await prisma.organizationStatus.deleteMany();
    await prisma.organizationObligation.deleteMany();
    await prisma.organization.deleteMany();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.organizationOperation.deleteMany();
    await prisma.organizationStatus.deleteMany();
    await prisma.organizationObligation.deleteMany();
    await prisma.organization.deleteMany();

    // Clean up nock mocks
    nock.cleanAll();

    await app.close();
  });

  describe('GET /api/org/organizations - RBAC Filtering', () => {
    let org1Id: string;
    let org2Id: string;
    let org3Id: string;
    let superAdminToken: string;

    beforeAll(async () => {
      // Create super admin token for setup
      superAdminToken = signPayload(
        {
          userId: 'super-admin-setup-123',
          username: 'superadmin@example.com',
          isSuperAdmin: true,
          role: 'Super Admin',
          permissions: ['*'],
        },
        process.env.JWT_SECRET || 'test-secret',
      );

      // Create test organizations via API
      const org1Response = await request
        .default(app.getHttpServer())
        .post('/api/org/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Test Org 1',
          tin: '001234567890',
          category: 'NON_INDIVIDUAL',
          subcategory: 'CORPORATION',
          tax_classification: 'VAT',
          registration_date: '2024-01-01T00:00:00.000Z',
          registered_name: 'Test Org 1 Ltd',
          first_name: 'John',
          last_name: 'CEO1',
          line_of_business: '6201',
          address_line: '123 Test St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          rdo_code: '001',
          contact_number: '+639123456789',
          email_address: 'test1@org.com',
          start_date: '2024-01-01T00:00:00.000Z',
          update_by: 'test-user',
        })
        .expect(201);
      org1Id = org1Response.body.id;

      const org2Response = await request
        .default(app.getHttpServer())
        .post('/api/org/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Test Org 2',
          tin: '001234567891',
          category: 'INDIVIDUAL',
          subcategory: 'SELF_EMPLOYED',
          tax_classification: 'NON_VAT',
          registration_date: '2024-01-01T00:00:00.000Z',
          registered_name: 'Test Org 2 Individual',
          first_name: 'Jane',
          last_name: 'Owner2',
          line_of_business: '6201',
          address_line: '456 Test St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          rdo_code: '001',
          contact_number: '+639123456790',
          email_address: 'test2@org.com',
          start_date: '2024-01-01T00:00:00.000Z',
          update_by: 'test-user',
        })
        .expect(201);
      org2Id = org2Response.body.id;

      const org3Response = await request
        .default(app.getHttpServer())
        .post('/api/org/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Test Org 3',
          tin: '001234567892',
          category: 'NON_INDIVIDUAL',
          subcategory: 'CORPORATION',
          tax_classification: 'VAT',
          registration_date: '2024-01-01T00:00:00.000Z',
          registered_name: 'Test Org 3 Ltd',
          first_name: 'Bob',
          last_name: 'CEO3',
          line_of_business: '6201',
          address_line: '789 Test St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          rdo_code: '001',
          contact_number: '+639123456791',
          email_address: 'test3@org.com',
          start_date: '2024-01-01T00:00:00.000Z',
          update_by: 'test-user',
        })
        .expect(201);
      org3Id = org3Response.body.id;
    });

    it('should return all organizations for super admin user', async () => {
      const superAdminToken = jwtService.sign({
        userId: 'super-admin-user-123',
        username: 'superadmin@example.com',
        isSuperAdmin: true,
        role: 'Super Admin',
        permissions: [],
      });

      const response = await request
        .default(app.getHttpServer())
        .get('/api/org/organizations')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      expect(response.body.some((org: any) => org.id === org1Id)).toBe(true);
      expect(response.body.some((org: any) => org.id === org2Id)).toBe(true);
      expect(response.body.some((org: any) => org.id === org3Id)).toBe(true);
    });

    it('should filter organizations by user accessible resources for non-super admin', async () => {
      // Set NODE_ENV to enable RBAC filtering
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const rbacJwtToken = signPayload(
        {
          userId: 'regular-user-123',
          username: 'regular@example.com',
          isSuperAdmin: false,
          role: 'Manager',
          permissions: ['resource:read'],
        },
        process.env.JWT_SECRET || 'test-secret',
      );

      // Mock RBAC API to return access to org1 and org2 only
      nock('http://localhost:3000')
        .get('/api/auth/me')
        .matchHeader('authorization', `Bearer ${rbacJwtToken}`)
        .reply(200, {
          id: 'regular-user-123',
          email: 'regular@example.com',
          isActive: true,
          isSuperAdmin: false,
          createdAt: '2025-10-02T13:27:17.611Z',
          updatedAt: '2025-10-02T13:27:17.611Z',
          details: {
            firstName: 'Regular',
            lastName: 'User',
            nickName: 'User',
            contactNumber: '+1-555-0102',
            reportTo: null
          },
          resources: [
            {
              resourceId: org1Id,
              role: 'Manager'
            },
            {
              resourceId: org2Id,
              role: 'Admin'
            }
          ]
        });

      const response = await request
        .default(app.getHttpServer())
        .get('/api/org/organizations')
        .set('Authorization', `Bearer ${rbacJwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some((org: any) => org.id === org1Id)).toBe(true);
      expect(response.body.some((org: any) => org.id === org2Id)).toBe(true);
      expect(response.body.some((org: any) => org.id === org3Id)).toBe(false);

      // Restore env
      process.env.NODE_ENV = originalEnv;
    });

    it('should return empty array when user has no accessible resources', async () => {
      // Set NODE_ENV to enable RBAC filtering
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const rbacJwtToken = signPayload(
        {
          userId: 'regular-user-no-access-123',
          username: 'noaccess@example.com',
          isSuperAdmin: false,
          role: 'User',
          permissions: ['resource:read'],
        },
        process.env.JWT_SECRET || 'test-secret',
      );

      // Mock RBAC API to return no resources
      nock('http://localhost:3000')
        .get('/api/auth/me')
        .matchHeader('authorization', `Bearer ${rbacJwtToken}`)
        .reply(200, {
          id: 'regular-user-no-access-123',
          email: 'noaccess@example.com',
          isActive: true,
          isSuperAdmin: false,
          createdAt: '2025-10-02T13:27:17.611Z',
          updatedAt: '2025-10-02T13:27:17.611Z',
          details: {
            firstName: 'No',
            lastName: 'Access',
            nickName: 'User',
            contactNumber: '+1-555-0103',
            reportTo: null
          },
          resources: []
        });

      const response = await request
        .default(app.getHttpServer())
        .get('/api/org/organizations')
        .set('Authorization', `Bearer ${rbacJwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      // Restore env
      process.env.NODE_ENV = originalEnv;
    });

    it('should return empty array and handle RBAC API failure gracefully', async () => {
      // Set NODE_ENV to enable RBAC filtering
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const rbacJwtToken = signPayload(
        {
          userId: 'regular-user-rbac-fail-123',
          username: 'rbacfail@example.com',
          isSuperAdmin: false,
          role: 'Manager',
          permissions: ['resource:read'],
        },
        process.env.JWT_SECRET || 'test-secret',
      );

      // Mock RBAC API to fail
      nock('http://localhost:3000')
        .get('/api/auth/me')
        .matchHeader('authorization', `Bearer ${rbacJwtToken}`)
        .reply(500, { error: 'RBAC API unavailable' });

      const response = await request
        .default(app.getHttpServer())
        .get('/api/org/organizations')
        .set('Authorization', `Bearer ${rbacJwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      // Restore env
      process.env.NODE_ENV = originalEnv;
    });

    it('should return 401 without authentication', async () => {
      await request
        .default(app.getHttpServer())
        .get('/api/org/organizations')
        .expect(401);
    });

    it('should return 403 without proper permissions', async () => {
      const noPermissionToken = signPayload(
        {
          userId: 'no-permission-user-123',
          username: 'noperm@example.com',
          isSuperAdmin: false,
          role: 'User',
          permissions: ['user:read'], // Missing organization:read permission
        },
        process.env.JWT_SECRET || 'test-secret',
      );

      await request
        .default(app.getHttpServer())
        .get('/api/org/organizations')
        .set('Authorization', `Bearer ${noPermissionToken}`)
        .expect(403);
    });
  });
});