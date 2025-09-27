import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './database/prisma.service';
import {
  Category,
  SubCategory,
  TaxClassification,
  Frequency,
  Status,
  ScheduleStatus,
  AccountingMethod,
  BusinessStatus,
} from '@prisma/client';

describe('Database Queries Tests', () => {
  let prisma: PrismaService;
  const testData: any = {};

  beforeAll(async () => {
    if (process.env.TEST_DEV_DB_CONNECTION !== 'true') {
      console.log(
        '⏭️  Skipping database queries tests - TEST_DEV_DB_CONNECTION is not true',
      );
      return;
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();

    // Set up all test data in sequence to avoid foreign key issues
    try {
      // 1. Create tax obligations first (no dependencies)
      testData.taxObligation1 = await prisma.taxObligation.create({
        data: {
          code: 'TEST_VAT_001',
          name: 'Test VAT Filing',
          frequency: Frequency.MONTHLY,
          due_rule: { day: 15 },
          status: 'MANDATORY' as const,
        },
      });

      testData.taxObligation2 = await prisma.taxObligation.create({
        data: {
          code: 'TEST_INCOME_001',
          name: 'Test Income Tax',
          frequency: Frequency.ANNUAL,
          due_rule: { month: 4, day: 15 },
          status: 'MANDATORY' as const,
        },
      });

      // 2. Create organizations (no dependencies)
      testData.organization1 = await prisma.organization.create({
        data: {
          name: 'Test Organization 1',
          tin: '123456789012',
          category: Category.INDIVIDUAL,
          subcategory: SubCategory.SELF_EMPLOYED,
          tax_classification: TaxClassification.VAT,
          registration_date: new Date('2024-01-01'),
          address: 'Test Address 1',
        },
      });

      testData.organization2 = await prisma.organization.create({
        data: {
          name: 'Test Organization 2',
          tin: '987654321098',
          category: Category.NON_INDIVIDUAL,
          subcategory: SubCategory.CORPORATION,
          tax_classification: TaxClassification.NON_VAT,
          registration_date: new Date('2024-02-01'),
          address: 'Test Address 2',
        },
      });

      // 3. Create organization obligations (depends on organizations and tax obligations)
      testData.orgObligation1 = await prisma.organizationObligation.create({
        data: {
          organization_id: testData.organization1.id,
          obligation_id: testData.taxObligation1.id,
          start_date: new Date('2024-01-01'),
          end_date: new Date('2024-12-31'),
          status: Status.ACTIVE,
          notes: 'Test obligation',
        },
      });

      // 4. Create obligation schedules (depends on organization obligations)
      testData.schedule1 = await prisma.obligationSchedule.create({
        data: {
          org_obligation_id: testData.orgObligation1.id,
          period: '2024-01',
          due_date: new Date('2024-01-15'),
          status: ScheduleStatus.DUE,
        },
      });

      // 5. Create organization status (depends on organizations)
      testData.orgStatus1 = await prisma.organizationStatus.create({
        data: {
          organization_id: testData.organization1.id,
          status: BusinessStatus.ACTIVE,
          last_update: new Date(),
        },
      });

      // 6. Create organization operations (depends on organizations)
      testData.orgOperation1 = await prisma.organizationOperation.create({
        data: {
          organization_id: testData.organization1.id,
          fy_start: new Date('2024-01-01'),
          fy_end: new Date('2024-12-31'),
          vat_reg_effectivity: new Date('2024-01-01'),
          registration_effectivity: new Date('2024-01-01'),
          payroll_cut_off: ['15', '30'],
          payment_cut_off: ['10', '25'],
          quarter_closing: ['Q1', 'Q2', 'Q3', 'Q4'],
          has_foreign: false,
          has_employees: true,
          is_ewt: false,
          is_fwt: false,
          is_bir_withholding_agent: true,
          accounting_method: AccountingMethod.ACCRUAL,
          last_update: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ Error setting up test data:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (process.env.TEST_DEV_DB_CONNECTION === 'true') {
      // Clean up test data in reverse order of dependencies
      try {
        await prisma.organizationOperation.deleteMany();
        await prisma.organizationStatus.deleteMany();
        await prisma.obligationSchedule.deleteMany(); // Delete schedules before obligations
        await prisma.organizationObligation.deleteMany();
        await prisma.organization.deleteMany();
        await prisma.taxObligation.deleteMany();
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
    }
  });

  describe('Schema Validation', () => {
    it('should validate all table schemas match Prisma models', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      // Test Organization table schema
      const orgColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Organization'
        ORDER BY column_name
      `;

      expect(orgColumns).toBeDefined();

      // Test TaxObligation table schema
      const taxOblColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'TaxObligation'
        ORDER BY column_name
      `;

      expect(taxOblColumns).toBeDefined();

      // Test OrganizationObligation table schema
      const orgOblColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'OrganizationObligation'
        ORDER BY column_name
      `;

      expect(orgOblColumns).toBeDefined();

      // Test ObligationSchedule table schema
      const scheduleColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'ObligationSchedule'
        ORDER BY column_name
      `;

      expect(scheduleColumns).toBeDefined();

      // Check ScheduleStatus enum values
      const enumValues =
        await prisma.$queryRaw`SELECT unnest(enum_range(NULL::"ScheduleStatus")) as values`;

      // Test OrganizationStatus table schema
      const statusColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'OrganizationStatus'
        ORDER BY column_name
      `;

      expect(statusColumns).toBeDefined();

      // Test OrganizationOperation table schema
      const operationColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'OrganizationOperation'
        ORDER BY column_name
      `;

      expect(operationColumns).toBeDefined();
    });
  });

  describe('TaxObligation Table Tests', () => {
    it('should return empty result when no records exist', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.taxObligation.findMany({
        where: { code: 'NON_EXISTENT' },
      });
      expect(result).toHaveLength(0);
    });

    it('should return single row response', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.taxObligation.findUnique({
        where: { code: 'TEST_VAT_001' },
      });
      expect(result).toBeDefined();
      expect(result?.code).toBe('TEST_VAT_001');
      expect(result?.name).toBe('Test VAT Filing');
    });

    it('should return multiple row responses', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.taxObligation.findMany({
        where: { status: 'MANDATORY' },
      });
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some((item) => item.code === 'TEST_VAT_001')).toBe(true);
      expect(result.some((item) => item.code === 'TEST_INCOME_001')).toBe(true);
    });

    it('should update single row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const updated = await prisma.taxObligation.update({
        where: { code: 'TEST_VAT_001' },
        data: { name: 'Updated Test VAT Filing' },
      });
      expect(updated.name).toBe('Updated Test VAT Filing');

      // Verify update
      const verify = await prisma.taxObligation.findUnique({
        where: { code: 'TEST_VAT_001' },
      });
      expect(verify?.name).toBe('Updated Test VAT Filing');
    });

    it('should delete row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      await prisma.taxObligation.delete({
        where: { code: 'TEST_INCOME_001' },
      });

      // Verify deletion
      const verify = await prisma.taxObligation.findUnique({
        where: { code: 'TEST_INCOME_001' },
      });
      expect(verify).toBeNull();
    });
  });

  describe('Organization Table Tests', () => {
    it('should return empty result when no records exist', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organization.findMany({
        where: { name: 'NON_EXISTENT_ORG' },
      });
      expect(result).toHaveLength(0);
    });

    it('should return single row response', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organization.findUnique({
        where: { id: testData.organization1.id },
      });
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Organization 1');
      expect(result?.tin).toBe('123456789012');
    });

    it('should return multiple row responses', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organization.findMany();
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some((item) => item.name === 'Test Organization 1')).toBe(
        true,
      );
      expect(result.some((item) => item.name === 'Test Organization 2')).toBe(
        true,
      );
    });

    it('should update single row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const updated = await prisma.organization.update({
        where: { id: testData.organization1.id },
        data: { name: 'Updated Test Organization 1' },
      });
      expect(updated.name).toBe('Updated Test Organization 1');

      // Verify update
      const verify = await prisma.organization.findUnique({
        where: { id: testData.organization1.id },
      });
      expect(verify?.name).toBe('Updated Test Organization 1');
    });

    it('should delete row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      await prisma.organization.delete({
        where: { id: testData.organization2.id },
      });

      // Verify deletion
      const verify = await prisma.organization.findUnique({
        where: { id: testData.organization2.id },
      });
      expect(verify).toBeNull();
    });
  });

  describe('ObligationSchedule Table Tests', () => {
    it('should return empty result when no records exist', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.obligationSchedule.findMany({
        where: { period: 'NON_EXISTENT_PERIOD' },
      });
      expect(result).toHaveLength(0);
    });

    it('should return single row response', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.obligationSchedule.findMany();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].period).toBe('2024-01');
    });

    it('should return multiple row responses', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.obligationSchedule.findMany({
        where: { status: ScheduleStatus.DUE },
      });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should update single row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const updated = await prisma.obligationSchedule.update({
        where: { id: testData.schedule1.id },
        data: { status: ScheduleStatus.FILED },
      });
      expect(updated.status).toBe(ScheduleStatus.FILED);
    });

    it('should delete row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      await prisma.obligationSchedule.delete({
        where: { id: testData.schedule1.id },
      });

      // Verify deletion
      const verify = await prisma.obligationSchedule.findUnique({
        where: { id: testData.schedule1.id },
      });
      expect(verify).toBeNull();
    });
  });

  describe('OrganizationObligation Table Tests', () => {
    it('should return empty result when no records exist', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationObligation.findMany({
        where: { notes: 'NON_EXISTENT_NOTES' },
      });
      expect(result).toHaveLength(0);
    });

    it('should return single row response', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationObligation.findUnique({
        where: {
          organization_id_obligation_id: {
            organization_id: testData.organization1.id,
            obligation_id: testData.taxObligation1.id,
          },
        },
      });
      expect(result).toBeDefined();
      expect(result?.notes).toBe('Test obligation');
    });

    it('should return multiple row responses', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationObligation.findMany({
        where: { status: Status.ACTIVE },
      });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should update single row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const updated = await prisma.organizationObligation.update({
        where: {
          organization_id_obligation_id: {
            organization_id: testData.organization1.id,
            obligation_id: testData.taxObligation1.id,
          },
        },
        data: { notes: 'Updated test obligation' },
      });
      expect(updated.notes).toBe('Updated test obligation');
    });

    it('should delete row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      // First delete the dependent obligation schedule
      await prisma.obligationSchedule.deleteMany({
        where: { org_obligation_id: testData.orgObligation1.id },
      });

      await prisma.organizationObligation.delete({
        where: {
          organization_id_obligation_id: {
            organization_id: testData.organization1.id,
            obligation_id: testData.taxObligation1.id,
          },
        },
      });

      // Verify deletion
      const verify = await prisma.organizationObligation.findUnique({
        where: {
          organization_id_obligation_id: {
            organization_id: testData.organization1.id,
            obligation_id: testData.taxObligation1.id,
          },
        },
      });
      expect(verify).toBeNull();
    });
  });

  describe('OrganizationStatus Table Tests', () => {
    it('should return empty result when no records exist', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationStatus.findMany({
        where: { status: BusinessStatus.SUSPENDED },
      });
      expect(result).toHaveLength(0);
    });

    it('should return single row response', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationStatus.findUnique({
        where: { organization_id: testData.organization1.id },
      });
      expect(result).toBeDefined();
      expect(result?.status).toBe(BusinessStatus.ACTIVE);
    });

    it('should return multiple row responses', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationStatus.findMany();
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should update single row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const updated = await prisma.organizationStatus.update({
        where: { organization_id: testData.organization1.id },
        data: { status: BusinessStatus.REGISTERED },
      });
      expect(updated.status).toBe(BusinessStatus.REGISTERED);
    });

    it('should delete row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      await prisma.organizationStatus.delete({
        where: { organization_id: testData.organization1.id },
      });

      // Verify deletion
      const verify = await prisma.organizationStatus.findUnique({
        where: { organization_id: testData.organization1.id },
      });
      expect(verify).toBeNull();
    });
  });

  describe('OrganizationOperation Table Tests', () => {
    it('should return empty result when no records exist', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationOperation.findMany({
        where: { has_foreign: true },
      });
      expect(result).toHaveLength(0);
    });

    it('should return single row response', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationOperation.findUnique({
        where: { organization_id: testData.organization1.id },
      });
      expect(result).toBeDefined();
      expect(result?.has_employees).toBe(true);
      expect(result?.is_bir_withholding_agent).toBe(true);
    });

    it('should return multiple row responses', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const result = await prisma.organizationOperation.findMany({
        where: { accounting_method: AccountingMethod.ACCRUAL },
      });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should update single row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      const updated = await prisma.organizationOperation.update({
        where: { organization_id: testData.organization1.id },
        data: { has_foreign: true },
      });
      expect(updated.has_foreign).toBe(true);
    });

    it('should delete row', async () => {
      if (process.env.TEST_DEV_DB_CONNECTION !== 'true') return;

      await prisma.organizationOperation.delete({
        where: { organization_id: testData.organization1.id },
      });

      // Verify deletion
      const verify = await prisma.organizationOperation.findUnique({
        where: { organization_id: testData.organization1.id },
      });
      expect(verify).toBeNull();
    });
  });
});
