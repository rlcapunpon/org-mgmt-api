import { validateEnvironment } from './config/app.config';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw error if JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    process.env.DATABASE_URL = 'test';

    expect(() => validateEnvironment()).toThrow(
      'Missing required environment variables: JWT_SECRET and DATABASE_URL must be set',
    );
  });

  it('should throw error if DATABASE_URL is missing', () => {
    process.env.JWT_SECRET = 'test';
    delete process.env.DATABASE_URL;

    expect(() => validateEnvironment()).toThrow(
      'Missing required environment variables: JWT_SECRET and DATABASE_URL must be set',
    );
  });

  it('should not throw if both are present', () => {
    process.env.JWT_SECRET = 'test';
    process.env.DATABASE_URL = 'test';

    expect(() => validateEnvironment()).not.toThrow();
  });
});
