/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationRepository } from '../repositories/organization.repository';
import { PrismaService } from '../../../database/prisma.service';

describe('OrganizationRepository - Step 10: Category-based registered_name requirement and naming logic', () => {
  let repository: OrganizationRepository;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationRepository,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            organization: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OrganizationRepository>(OrganizationRepository);
    prismaMock = module.get(PrismaService);
  });

  describe('INDIVIDUAL category organization creation', () => {
    it('should create organization with name from first_name + middle_name + last_name', async () => {
      const data = {
        category: 'INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        subcategory: 'SELF_EMPLOYED' as const,
        registration_date: new Date('2024-01-01'),
        // Registration fields for INDIVIDUAL
        first_name: 'John',
        middle_name: 'Michael',
        last_name: 'Doe',
        registered_name: 'John Doe Enterprises', // Optional for INDIVIDUAL
        trade_name: null,
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        start_date: new Date('2024-01-01'),
        update_by: 'test-user',
      };

      const mockOrg = {
        id: 'uuid',
        name: 'John Michael Doe', // Should be first_name + middle_name + last_name
        category: 'INDIVIDUAL',
        tax_classification: 'VAT',
        tin: '001234567890',
        subcategory: 'SELF_EMPLOYED',
        registration_date: new Date('2024-01-01'),
        address: '123 Main St, Makati, NCR, 1223',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-uuid',
          organization_id: 'uuid',
          status: 'PENDING_REG',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        registration: {
          organization_id: 'uuid',
          first_name: 'John',
          middle_name: 'Michael',
          last_name: 'Doe',
          trade_name: null,
          line_of_business: '6201',
          address_line: '123 Main St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          tin: '001234567890',
          rdo_code: '001',
          contact_number: '+639123456789',
          email_address: 'john.doe@example.com',
          tax_type: 'VAT',
          start_date: new Date('2024-01-01'),
          reg_date: new Date('2024-01-01'),
          update_date: new Date(),
          update_by: 'test-user',
          created_at: new Date(),
          updated_at: new Date(),
          registered_name: 'John Doe Enterprises', // Should be set from input
        },
      };

      (prismaMock.organization.create as jest.Mock).mockResolvedValue(mockOrg);

      const result = await repository.create(data);
      expect(result).toEqual(mockOrg);
      expect(result.name).toBe('John Michael Doe');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).registration.registered_name).toBe('John Doe Enterprises');
    });

    it('should create organization with name from first_name + last_name when middle_name is null', async () => {
      const data = {
        category: 'INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        subcategory: 'SELF_EMPLOYED' as const,
        registration_date: new Date('2024-01-01'),
        // Registration fields for INDIVIDUAL
        first_name: 'John',
        middle_name: null,
        last_name: 'Doe',
        registered_name: 'John Doe Freelance', // Optional for INDIVIDUAL
        trade_name: null,
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        start_date: new Date('2024-01-01'),
        update_by: 'test-user',
      };

      const mockOrg = {
        id: 'uuid',
        name: 'John Doe', // Should be first_name + last_name (middle_name null)
        category: 'INDIVIDUAL',
        tax_classification: 'VAT',
        tin: '001234567890',
        subcategory: 'SELF_EMPLOYED',
        registration_date: new Date('2024-01-01'),
        address: '123 Main St, Makati, NCR, 1223',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-uuid',
          organization_id: 'uuid',
          status: 'PENDING_REG',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        registration: {
          organization_id: 'uuid',
          first_name: 'John',
          middle_name: null,
          last_name: 'Doe',
          trade_name: null,
          line_of_business: '6201',
          address_line: '123 Main St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          tin: '001234567890',
          rdo_code: '001',
          contact_number: '+639123456789',
          email_address: 'john.doe@example.com',
          tax_type: 'VAT',
          start_date: new Date('2024-01-01'),
          reg_date: new Date('2024-01-01'),
          update_date: new Date(),
          update_by: 'test-user',
          created_at: new Date(),
          updated_at: new Date(),
          registered_name: 'John Doe Freelance',
        },
      };

      (prismaMock.organization.create as jest.Mock).mockResolvedValue(mockOrg);

      const result = await repository.create(data);
      expect(result).toEqual(mockOrg);
      expect(result.name).toBe('John Doe');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).registration.registered_name).toBe('John Doe Freelance');
    });

    it('should create organization with name from first_name + last_name when registered_name is not provided', async () => {
      const data = {
        category: 'INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        subcategory: 'SELF_EMPLOYED' as const,
        registration_date: new Date('2024-01-01'),
        // Registration fields for INDIVIDUAL
        first_name: 'Jane',
        middle_name: null,
        last_name: 'Smith',
        // registered_name not provided - should be optional for INDIVIDUAL
        trade_name: null,
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'jane.smith@example.com',
        start_date: new Date('2024-01-01'),
        update_by: 'test-user',
      };

      const mockOrg = {
        id: 'uuid',
        name: 'Jane Smith', // Should be first_name + last_name
        category: 'INDIVIDUAL',
        tax_classification: 'VAT',
        tin: '001234567890',
        subcategory: 'SELF_EMPLOYED',
        registration_date: new Date('2024-01-01'),
        address: '123 Main St, Makati, NCR, 1223',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-uuid',
          organization_id: 'uuid',
          status: 'PENDING_REG',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        registration: {
          organization_id: 'uuid',
          first_name: 'Jane',
          middle_name: null,
          last_name: 'Smith',
          trade_name: null,
          line_of_business: '6201',
          address_line: '123 Main St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          tin: '001234567890',
          rdo_code: '001',
          contact_number: '+639123456789',
          email_address: 'jane.smith@example.com',
          tax_type: 'VAT',
          start_date: new Date('2024-01-01'),
          reg_date: new Date('2024-01-01'),
          update_date: new Date(),
          update_by: 'test-user',
          created_at: new Date(),
          updated_at: new Date(),
          registered_name: '', // Should be empty when not provided
        },
      };

      (prismaMock.organization.create as jest.Mock).mockResolvedValue(mockOrg);

      const result = await repository.create(data);
      expect(result).toEqual(mockOrg);
      expect(result.name).toBe('Jane Smith');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).registration.registered_name).toBe('');
    });
  });

  describe('NON_INDIVIDUAL category organization creation', () => {
    it('should create organization with name from registered_name', async () => {
      const data = {
        category: 'NON_INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        subcategory: 'CORPORATION' as const,
        registration_date: new Date('2024-01-01'),
        // Registration fields for NON_INDIVIDUAL
        registered_name: 'ABC Corporation Inc.', // Required for NON_INDIVIDUAL
        trade_name: 'ABC Trading',
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'contact@abc.com',
        start_date: new Date('2024-01-01'),
        update_by: 'test-user',
      };

      const mockOrg = {
        id: 'uuid',
        name: 'ABC Corporation Inc.', // Should be the registered_name
        category: 'NON_INDIVIDUAL',
        tax_classification: 'VAT',
        tin: '001234567890',
        subcategory: 'CORPORATION',
        registration_date: new Date('2024-01-01'),
        address: '123 Main St, Makati, NCR, 1223',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-uuid',
          organization_id: 'uuid',
          status: 'PENDING_REG',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        registration: {
          organization_id: 'uuid',
          first_name: '', // Empty for NON_INDIVIDUAL
          middle_name: null,
          last_name: '', // Empty for NON_INDIVIDUAL
          trade_name: 'ABC Trading',
          line_of_business: '6201',
          address_line: '123 Main St',
          region: 'NCR',
          city: 'Makati',
          zip_code: '1223',
          tin: '001234567890',
          rdo_code: '001',
          contact_number: '+639123456789',
          email_address: 'contact@abc.com',
          tax_type: 'VAT',
          start_date: new Date('2024-01-01'),
          reg_date: new Date('2024-01-01'),
          update_date: new Date(),
          update_by: 'test-user',
          created_at: new Date(),
          updated_at: new Date(),
          registered_name: 'ABC Corporation Inc.', // Should be set from input
        },
      };

      (prismaMock.organization.create as jest.Mock).mockResolvedValue(mockOrg);

      const result = await repository.create(data);
      expect(result).toEqual(mockOrg);
      expect(result.name).toBe('ABC Corporation Inc.');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((result as any).registration.registered_name).toBe(
        'ABC Corporation Inc.',
      );
    });
  });

  describe('Validation errors', () => {
    it('should fail when INDIVIDUAL category is missing required first_name', async () => {
      const data = {
        category: 'INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        registration_date: new Date('2024-01-01'),
        registered_name: 'John Doe Enterprises',
        // Missing first_name for INDIVIDUAL
        last_name: 'Doe',
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        start_date: new Date('2024-01-01'),
        update_by: 'test-user',
      };

      await expect(repository.create(data as any)).rejects.toThrow(
        'first_name and last_name are required for INDIVIDUAL category',
      );
    });

    it('should fail when INDIVIDUAL category is missing required last_name', async () => {
      const data = {
        category: 'INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        registration_date: new Date('2024-01-01'),
        registered_name: 'John Doe Enterprises',
        first_name: 'John',
        // Missing last_name for INDIVIDUAL
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john.doe@example.com',
        start_date: new Date('2024-01-01'),
        update_by: 'test-user',
      };

      await expect(repository.create(data as any)).rejects.toThrow(
        'first_name and last_name are required for INDIVIDUAL category',
      );
    });

    it('should fail when NON_INDIVIDUAL category is missing registered_name', async () => {
      const data = {
        category: 'NON_INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: '001234567890',
        registration_date: new Date('2024-01-01'),
        // Missing registered_name for NON_INDIVIDUAL
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'contact@abc.com',
        start_date: new Date('2024-01-01'),
        update_by: 'test-user',
      };

      await expect(repository.create(data as any)).rejects.toThrow(
        'registered_name is required for NON_INDIVIDUAL category',
      );
    });
  });
});
