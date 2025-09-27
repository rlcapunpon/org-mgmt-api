import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../src/modules/users/services/user.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    jwtService = moduleFixture.get(JwtService);
    userService = moduleFixture.get(UserService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/overview', () => {
    it('should return user overview with authentication', async () => {
      // Create a test user JWT token
      const payload = {
        userId: 'test-user-123',
        username: 'testuser',
        permissions: ['user.read'],
        isSuperAdmin: false,
        role: 'Manager',
      };
      const token = jwtService.sign(payload);

      // Mock the user service method since we don't have real data
      jest.spyOn(userService, 'getUserOverview').mockResolvedValue({
        organizationsOwned: 2,
        organizationsAssigned: 3,
        obligationsDueWithin30Days: 5,
        totalObligations: 15,
      });

      const response = await request.default(app.getHttpServer())
        .get('/users/overview')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        organizationsOwned: 2,
        organizationsAssigned: 3,
        obligationsDueWithin30Days: 5,
        totalObligations: 15,
      });
    });

    it('should return 401 without authentication', async () => {
      await request.default(app.getHttpServer())
        .get('/users/overview')
        .expect(401);
    });

    it('should return 403 without proper permissions', async () => {
      const payload = {
        userId: 'test-user-123',
        username: 'testuser',
        permissions: ['organization.read'], // Missing user.read permission
        isSuperAdmin: false,
        role: 'User',
      };
      const token = jwtService.sign(payload);

      await request.default(app.getHttpServer())
        .get('/users/overview')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});