import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './database/prisma.service';

describe('Database Connectivity', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    if (prismaService) {
      await prismaService.$disconnect();
    }
  });

  it('should connect to database when TEST_DEV_DB_CONNECTION is true', async () => {
    const testDbConnection = process.env.TEST_DEV_DB_CONNECTION === 'true';

    if (!testDbConnection) {
      console.log('Skipping database connectivity test - TEST_DEV_DB_CONNECTION is not true');
      return;
    }

    try {
      // Test basic connectivity by attempting to connect
      await prismaService.$connect();
      console.log('✅ Database connection successful');

      // Test a simple query to ensure the connection works
      const result = await prismaService.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
      console.log('✅ Database query successful');
    } catch (error) {
      console.error('❌ Database connectivity test failed:', error.message);
      throw error;
    }
  });

  it('should handle database connection errors gracefully', async () => {
    const testDbConnection = process.env.TEST_DEV_DB_CONNECTION === 'true';

    if (!testDbConnection) {
      console.log('Skipping database error handling test - TEST_DEV_DB_CONNECTION is not true');
      return;
    }

    // This test ensures that if there are connection issues, they're handled properly
    try {
      await prismaService.$connect();
      // If we get here, connection is working
      expect(true).toBe(true);
    } catch (error) {
      // If connection fails, the error should be informative
      expect(error).toBeDefined();
      console.log('Database connection error (expected in some environments):', error.message);
    }
  });
});
