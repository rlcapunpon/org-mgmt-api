import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';
import { signPayload } from '../../../test-utils/token';
import { OrganizationService } from '../services/organization.service';
import { PrismaService } from '../../../database/prisma.service';
import {
  Category,
  SubCategory,
  TaxClassification,
  AccountingMethod,
} from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('Organization Integration Tests (e2e)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<OrganizationService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrganizationService)
      .useValue({
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        list: jest.fn(),
        getOperationByOrgId: jest.fn(),
        updateOperation: jest.fn(),
      })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    mockService = moduleFixture.get(OrganizationService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Organization CRUD with SubCategories', () => {
    it('should create organization with SELF_EMPLOYED subcategory', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:create'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const payload = {
        name: 'John Doe Self Employed',
        category: 'INDIVIDUAL',
        subcategory: 'SELF_EMPLOYED',
        tax_classification: 'NON_VAT',
        // Registration fields
        first_name: 'John',
        last_name: 'Doe',
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        tin_registration: '001234567890',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        tax_type: 'NON_VAT',
        start_date: '2024-01-01',
        reg_date: '2024-01-01',
      };

      const mockOrg = {
        id: '1',
        name: 'John Doe Self Employed',
        category: Category.INDIVIDUAL,
        subcategory: SubCategory.SELF_EMPLOYED,
        tax_classification: TaxClassification.NON_VAT,
        tin: null,
        registration_date: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-1',
          organization_id: '1',
          status: 'PENDING',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        operation: {
          id: 'operation-1',
          organization_id: '1',
          fy_start: new Date('2025-01-01'),
          fy_end: new Date('2025-12-31'),
          vat_reg_effectivity: new Date('2025-01-01'),
          registration_effectivity: new Date('2025-01-01'),
          payroll_cut_off: ['15/30'],
          payment_cut_off: ['15/30'],
          quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
          has_foreign: false,
          has_employees: false,
          is_ewt: false,
          is_fwt: false,
          is_bir_withholding_agent: false,
          accounting_method: AccountingMethod.ACCRUAL,
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockService.create.mockResolvedValue(mockOrg);

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: '1',
        name: 'John Doe Self Employed',
        category: 'INDIVIDUAL',
        subcategory: 'SELF_EMPLOYED',
        tax_classification: 'NON_VAT',
      });
      expect(res.body).toHaveProperty('operation');
      expect(res.body.operation).toHaveProperty('has_employees', false);
    });

    it('should create organization with SOLE_PROPRIETOR subcategory', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:create'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const payload = {
        name: 'Jane Smith Sole Proprietor',
        category: 'INDIVIDUAL',
        subcategory: 'SOLE_PROPRIETOR',
        tax_classification: 'VAT',
        // Registration fields
        first_name: 'Jane',
        last_name: 'Smith',
        line_of_business: '6202',
        address_line: '456 Business Ave',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        tin_registration: '001234567891',
        rdo_code: '002',
        contact_number: '+639123456790',
        email_address: 'jane.smith@example.com',
        tax_type: 'VAT',
        start_date: '2024-01-01',
        reg_date: '2024-01-01',
      };

      const mockOrg = {
        id: '2',
        name: 'Jane Smith Sole Proprietor',
        category: Category.INDIVIDUAL,
        subcategory: SubCategory.SOLE_PROPRIETOR,
        tax_classification: TaxClassification.VAT,
        tin: '123456789',
        registration_date: new Date('2024-01-01'),
        address: 'Makati City',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-2',
          organization_id: '2',
          status: 'PENDING',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        operation: {
          id: 'operation-2',
          organization_id: '2',
          fy_start: new Date('2025-01-01'),
          fy_end: new Date('2025-12-31'),
          vat_reg_effectivity: new Date('2025-01-01'),
          registration_effectivity: new Date('2025-01-01'),
          payroll_cut_off: ['15/30'],
          payment_cut_off: ['15/30'],
          quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
          has_foreign: false,
          has_employees: false,
          is_ewt: false,
          is_fwt: false,
          is_bir_withholding_agent: false,
          accounting_method: AccountingMethod.ACCRUAL,
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockService.create.mockResolvedValue(mockOrg);

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: '2',
        name: 'Jane Smith Sole Proprietor',
        category: 'INDIVIDUAL',
        subcategory: 'SOLE_PROPRIETOR',
        tax_classification: 'VAT',
        tin: '123456789',
        address: 'Makati City',
      });
    });

    it('should create organization with FREELANCER subcategory', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:create'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const payload = {
        name: 'Bob Freelancer',
        category: 'INDIVIDUAL',
        subcategory: 'FREELANCER',
        tax_classification: 'NON_VAT',
        // Registration fields
        first_name: 'Bob',
        last_name: 'Freelancer',
        line_of_business: '6203',
        address_line: '789 Creative St',
        region: 'NCR',
        city: 'Quezon',
        zip_code: '1100',
        tin_registration: '001234567892',
        rdo_code: '003',
        contact_number: '+639123456791',
        email_address: 'bob.freelancer@example.com',
        tax_type: 'NON_VAT',
        start_date: '2024-01-01',
        reg_date: '2024-01-01',
      };

      const mockOrg = {
        id: '3',
        name: 'Bob Freelancer',
        category: Category.INDIVIDUAL,
        subcategory: SubCategory.FREELANCER,
        tax_classification: TaxClassification.NON_VAT,
        tin: null,
        registration_date: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-3',
          organization_id: '3',
          status: 'PENDING',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        operation: {
          id: 'operation-3',
          organization_id: '3',
          fy_start: new Date('2025-01-01'),
          fy_end: new Date('2025-12-31'),
          vat_reg_effectivity: new Date('2025-01-01'),
          registration_effectivity: new Date('2025-01-01'),
          payroll_cut_off: ['15/30'],
          payment_cut_off: ['15/30'],
          quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
          has_foreign: false,
          has_employees: false,
          is_ewt: false,
          is_fwt: false,
          is_bir_withholding_agent: false,
          accounting_method: AccountingMethod.ACCRUAL,
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockService.create.mockResolvedValue(mockOrg);

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.subcategory).toBe('FREELANCER');
    });

    it('should create NON_INDIVIDUAL organization with CORPORATION subcategory', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:create'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const payload = {
        name: 'ABC Corporation',
        category: 'NON_INDIVIDUAL',
        subcategory: 'CORPORATION',
        tax_classification: 'VAT',
        // Registration fields
        first_name: 'John',
        last_name: 'CEO',
        line_of_business: '6204',
        address_line: '123 Corporate Blvd',
        region: 'NCR',
        city: 'Taguig',
        zip_code: '1630',
        tin_registration: '001234567893',
        rdo_code: '004',
        contact_number: '+639123456792',
        email_address: 'john.ceo@abc-corp.com',
        tax_type: 'VAT',
        start_date: '2020-01-01',
        reg_date: '2020-01-01',
      };

      const mockOrg = {
        id: '4',
        name: 'ABC Corporation',
        category: Category.NON_INDIVIDUAL,
        subcategory: SubCategory.CORPORATION,
        tax_classification: TaxClassification.VAT,
        tin: '001234567890',
        registration_date: new Date('2020-01-01'),
        address: ' BGC, Taguig City',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-4',
          organization_id: '4',
          status: 'PENDING',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        operation: {
          id: 'operation-4',
          organization_id: '4',
          fy_start: new Date('2025-01-01'),
          fy_end: new Date('2025-12-31'),
          vat_reg_effectivity: new Date('2025-01-01'),
          registration_effectivity: new Date('2025-01-01'),
          payroll_cut_off: ['15/30'],
          payment_cut_off: ['15/30'],
          quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
          has_foreign: false,
          has_employees: false,
          is_ewt: false,
          is_fwt: false,
          is_bir_withholding_agent: false,
          accounting_method: AccountingMethod.ACCRUAL,
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockService.create.mockResolvedValue(mockOrg);

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.category).toBe('NON_INDIVIDUAL');
      expect(res.body.subcategory).toBe('CORPORATION');
    });

    it('should create organization with EXCEMPT tax classification', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:create'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const payload = {
        name: 'Tax Exempt Organization',
        category: 'NON_INDIVIDUAL',
        subcategory: 'PARTNERSHIP',
        tax_classification: 'EXCEMPT',
        // Registration fields
        first_name: 'Exempt',
        last_name: 'Org',
        line_of_business: '6207',
        address_line: '123 Exempt Blvd',
        region: 'NCR',
        city: 'Pasig',
        zip_code: '1600',
        tin_registration: '001234567896',
        rdo_code: '007',
        contact_number: '+639123456795',
        email_address: 'exempt@taxfree.com',
        tax_type: 'EXCEMPT',
        start_date: '2021-01-01',
        reg_date: '2021-01-01',
      };

      const mockOrg = {
        id: '5',
        name: 'Tax Exempt Organization',
        category: Category.NON_INDIVIDUAL,
        subcategory: SubCategory.PARTNERSHIP,
        tax_classification: TaxClassification.EXCEMPT,
        tin: '001234567891',
        registration_date: new Date('2021-01-01'),
        address: 'Pasig City',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-5',
          organization_id: '5',
          status: 'PENDING',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        operation: {
          id: 'operation-5',
          organization_id: '5',
          fy_start: new Date('2025-01-01'),
          fy_end: new Date('2025-12-31'),
          vat_reg_effectivity: new Date('2025-01-01'),
          registration_effectivity: new Date('2025-01-01'),
          payroll_cut_off: ['15/30'],
          payment_cut_off: ['15/30'],
          quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
          has_foreign: false,
          has_employees: false,
          is_ewt: false,
          is_fwt: false,
          is_bir_withholding_agent: false,
          accounting_method: AccountingMethod.ACCRUAL,
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      mockService.create.mockResolvedValue(mockOrg);

      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.category).toBe('NON_INDIVIDUAL');
      expect(res.body.subcategory).toBe('PARTNERSHIP');
      expect(res.body.tax_classification).toBe('EXCEMPT');
    });

    it('should reject invalid subcategory enum value', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:create'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const payload = {
        name: 'Invalid Subcategory Org',
        category: 'INDIVIDUAL',
        subcategory: 'INVALID_SUBCATEGORY',
        tax_classification: 'VAT',
        // Registration fields
        first_name: 'Invalid',
        last_name: 'Test',
        line_of_business: '6205',
        address_line: '123 Test St',
        region: 'NCR',
        city: 'Test City',
        zip_code: '1234',
        tin_registration: '001234567894',
        rdo_code: '005',
        contact_number: '+639123456793',
        email_address: 'invalid@test.com',
        tax_type: 'VAT',
        start_date: '2024-01-01',
        reg_date: '2024-01-01',
      };

      // Don't mock the service for validation tests - let it fail at service level
      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(400);
    });

    it('should reject invalid tax classification', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:create'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const payload = {
        name: 'Invalid Tax Classification Org',
        category: 'INDIVIDUAL',
        subcategory: 'SELF_EMPLOYED',
        tax_classification: 'INVALID_TAX_CLASS',
        // Registration fields
        first_name: 'Tax',
        last_name: 'Invalid',
        line_of_business: '6206',
        address_line: '456 Invalid St',
        region: 'NCR',
        city: 'Invalid City',
        zip_code: '5678',
        tin_registration: '001234567895',
        rdo_code: '006',
        contact_number: '+639123456794',
        email_address: 'tax.invalid@test.com',
        tax_type: 'INVALID_TAX_CLASS',
        start_date: '2024-01-01',
        reg_date: '2024-01-01',
      };

      // Don't mock the service for validation tests - let it fail at service level
      const res = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(400);
    });
  });

  describe('Organization Operation Updates', () => {
    it('should update organization operation with employee flags', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:update'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const updateData = {
        has_employees: true,
        is_ewt: true,
        is_fwt: false,
        is_bir_withholding_agent: true,
        accounting_method: 'CASH',
      };

      const mockUpdatedOperation = {
        id: 'operation-1',
        organization_id: '1',
        fy_start: new Date('2025-01-01'),
        fy_end: new Date('2025-12-31'),
        vat_reg_effectivity: new Date('2025-01-01'),
        registration_effectivity: new Date('2025-01-01'),
        payroll_cut_off: ['15/30'],
        payment_cut_off: ['15/30'],
        quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
        has_foreign: false,
        has_employees: true,
        is_ewt: true,
        is_fwt: false,
        is_bir_withholding_agent: true,
        accounting_method: AccountingMethod.CASH,
        last_update: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.updateOperation.mockResolvedValue(mockUpdatedOperation);

      const res = await request(app.getHttpServer())
        .put('/organizations/1/operation')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        has_employees: true,
        is_ewt: true,
        is_fwt: false,
        is_bir_withholding_agent: true,
        accounting_method: 'CASH',
      });
    });

    it('should handle partial operation updates', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:update'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );
      const updateData = {
        has_foreign: true,
        accounting_method: 'ACCRUAL',
      };

      const mockUpdatedOperation = {
        id: 'operation-1',
        organization_id: '1',
        fy_start: new Date('2025-01-01'),
        fy_end: new Date('2025-12-31'),
        vat_reg_effectivity: new Date('2025-01-01'),
        registration_effectivity: new Date('2025-01-01'),
        payroll_cut_off: ['15/30'],
        payment_cut_off: ['15/30'],
        quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
        has_foreign: true,
        has_employees: false,
        is_ewt: false,
        is_fwt: false,
        is_bir_withholding_agent: false,
        accounting_method: AccountingMethod.ACCRUAL,
        last_update: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.updateOperation.mockResolvedValue(mockUpdatedOperation);

      const res = await request(app.getHttpServer())
        .put('/organizations/1/operation')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.has_foreign).toBe(true);
      expect(res.body.accounting_method).toBe('ACCRUAL');
    });
  });

  describe('Organization Filtering', () => {
    it('should filter organizations by subcategory', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      const mockOrgs = [
        {
          id: '1',
          name: 'Self Employed Org',
          category: Category.INDIVIDUAL,
          subcategory: SubCategory.SELF_EMPLOYED,
          tax_classification: TaxClassification.NON_VAT,
          tin: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          status: {
            id: 'status-1',
            organization_id: '1',
            status: 'PENDING',
            last_update: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ];

      mockService.list.mockResolvedValue(mockOrgs);

      const res = await request(app.getHttpServer())
        .get('/organizations?category=INDIVIDUAL&subcategory=SELF_EMPLOYED')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].subcategory).toBe('SELF_EMPLOYED');
    });

    it('should filter organizations by tax classification', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      const mockOrgs = [
        {
          id: '1',
          name: 'VAT Registered Org',
          category: Category.INDIVIDUAL,
          subcategory: SubCategory.SOLE_PROPRIETOR,
          tax_classification: TaxClassification.VAT,
          tin: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          status: {
            id: 'status-1',
            organization_id: '1',
            status: 'PENDING',
            last_update: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ];

      mockService.list.mockResolvedValue(mockOrgs);

      const res = await request(app.getHttpServer())
        .get('/organizations?tax_classification=VAT')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].tax_classification).toBe('VAT');
    });

    it('should filter organizations by EXCEMPT tax classification', async () => {
      const token = signPayload(
        {
          userId: 'u1',
          permissions: ['resource:read'],
          isSuperAdmin: false,
          role: 'User',
        },
        process.env.JWT_SECRET!,
      );

      const mockOrgs = [
        {
          id: '1',
          name: 'Tax Exempt Org',
          category: Category.NON_INDIVIDUAL,
          subcategory: SubCategory.PARTNERSHIP,
          tax_classification: TaxClassification.EXCEMPT,
          tin: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          status: {
            id: 'status-1',
            organization_id: '1',
            status: 'PENDING',
            last_update: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      ];

      mockService.list.mockResolvedValue(mockOrgs);

      const res = await request(app.getHttpServer())
        .get('/organizations?tax_classification=EXCEMPT')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].tax_classification).toBe('EXCEMPT');
    });
  });
});
