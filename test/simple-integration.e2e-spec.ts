/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { signPayload } from '../src/test-utils/token';

describe('Simple API Integration Tests', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Generate test JWT token
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    const payload = {
      sub: 'test-user-id',
      username: 'testuser',
      permissions: [
        'resource:create',
        'resource:read',
        'resource:update',
        'resource:delete',
        'tax:configure',
        '*',
      ],
    };
    authToken = signPayload(payload, jwtSecret);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('Tax Obligations API', () => {
    it('should get tax obligations list (GET)', () => {
      return request(app.getHttpServer())
        .get('/tax-obligations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Organizations API', () => {
    it('should get organizations list (GET)', () => {
      return request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should handle non-existent organization (GET)', () => {
      return request(app.getHttpServer())
        .get('/organizations/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Tax Obligation Management', () => {
    it('should create a new tax obligation (POST)', () => {
      return request(app.getHttpServer())
        .post('/tax-obligations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TEST_VAT_001',
          name: 'Test VAT Filing',
          frequency: 'MONTHLY',
          due_rule: { day: 20 },
          status: 'MANDATORY',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.code).toBe('TEST_VAT_001');
          expect(res.body.name).toBe('Test VAT Filing');
          expect(res.body.frequency).toBe('MONTHLY');
        });
    });
  });

  describe('Authentication', () => {
    it('should require authentication for protected endpoints', () => {
      return request(app.getHttpServer()).get('/organizations').expect(401);
    });

    it('should reject invalid tokens', () => {
      return request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
