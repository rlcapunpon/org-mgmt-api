/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationRepository } from '../repositories/organization.repository';
import { PrismaService } from '../../../database/prisma.service';

describe('OrganizationRepository', () => {
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

  it('createOrganization should fail when required fields missing', async () => {
    await expect(repository.create({} as any)).rejects.toThrow(
      'Required fields missing',
    );
  });

  it('createOrganization should create a record and return the new org with id and timestamps', async () => {
    const data = {
      name: 'Test Org',
      category: 'NON_INDIVIDUAL' as const,
      tax_classification: 'VAT' as const,
      tin: '001234567890',
      subcategory: null,
      registration_date: new Date('2024-01-01'),
      address: '123 Main St, Makati, NCR 1223',
      // Registration fields
      first_name: 'John',
      middle_name: 'Michael',
      last_name: 'Doe',
      registered_name: 'Test Org',
      trade_name: 'Test Trading',
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
      // OrganizationOperation fields (optional)
      fy_start: new Date('2024-01-01'),
      fy_end: new Date('2024-12-31'),
      accounting_method: 'ACCRUAL',
    };
    const mockOrg = {
      id: 'uuid',
      ...data,
      tin: null,
      subcategory: null,
      registration_date: null,
      address: null,
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
        registered_name: 'Test Org',
        trade_name: 'Test Trading',
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
      },
      owners: [
        {
          id: 'owner-uuid',
          org_id: 'uuid',
          user_id: 'test-user',
          last_update: new Date(),
          assigned_date: new Date(),
        },
      ],
    };
    (prismaMock.organization.create as jest.Mock).mockResolvedValue(mockOrg);

    const result = await repository.create(data);
    expect(result).toEqual(mockOrg);
    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: {
        name: 'Test Org',
        category: 'NON_INDIVIDUAL',
        tax_classification: 'VAT',
        tin: '001234567890',
        subcategory: null,
        registration_date: new Date('2024-01-01'),
        address: '123 Main St, Makati, NCR, 1223',
        deleted_at: null,
        status: {
          create: {
            status: 'PENDING_REG',
          },
        },
        operation: {
          create: {
            fy_start: new Date('2024-01-01'),
            fy_end: new Date('2024-12-31'),
            vat_reg_effectivity: new Date('2024-12-31T16:00:00.000Z'),
            registration_effectivity: new Date('2024-12-31T16:00:00.000Z'),
            payroll_cut_off: ['15/30'],
            payment_cut_off: ['15/30'],
            quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
            has_foreign: false,
            has_employees: false,
            is_ewt: false,
            is_fwt: false,
            is_bir_withholding_agent: false,
            accounting_method: 'ACCRUAL',
          },
        },
        registration: {
          create: {
            first_name: 'John',
            middle_name: 'Michael',
            last_name: 'Doe',
            registered_name: 'Test Org',
            trade_name: 'Test Trading',
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
            update_by: 'test-user',
          },
        },
        // owners: {
        //   create: {
        //     user_id: 'test-user',
        //   },
        // },
      },
      include: {
        status: true,
        operation: true,
        registration: true,
        // owners: true,
      },
    });
  });

  it('getOrganizationById should return null for non-existing id', async () => {
    (prismaMock.organization.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.getById('non-existing');
    expect(result).toBeNull();
    expect(prismaMock.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 'non-existing' },
      include: {
        status: true,
      },
    });
  });

  it('listOrganizations supports filters category, tax_classification', async () => {
    const mockOrgs = [
      {
        id: '1',
        name: 'Org1',
        category: 'NON_INDIVIDUAL' as const,
        tax_classification: 'VAT' as const,
        tin: null,
        subcategory: null,
        registration_date: null,
        address: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        status: {
          id: 'status-1',
          organization_id: '1',
          status: 'PENDING_REG',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      },
    ];
    (prismaMock.organization.findMany as jest.Mock).mockResolvedValue(mockOrgs);

    const result = await repository.list({
      category: 'NON_INDIVIDUAL',
      tax_classification: 'VAT',
    });
    expect(result).toEqual(mockOrgs);
    expect(prismaMock.organization.findMany).toHaveBeenCalledWith({
      where: {
        deleted_at: null,
        category: 'NON_INDIVIDUAL',
        tax_classification: 'VAT',
      },
      include: {
        status: true,
      },
    });
  });

  it('update should update organization and return updated record', async () => {
    const updateData = { name: 'Updated Name' };
    const mockUpdatedOrg = {
      id: '1',
      name: 'Updated Name',
      category: 'NON_INDIVIDUAL' as const,
      tax_classification: 'VAT' as const,
      tin: null,
      subcategory: null,
      registration_date: null,
      address: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      status: {
        id: 'status-1',
        organization_id: '1',
        status: 'PENDING_REG',
        last_update: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    };
    (prismaMock.organization.update as jest.Mock).mockResolvedValue(
      mockUpdatedOrg,
    );

    const result = await repository.update('1', updateData);
    expect(result).toEqual(mockUpdatedOrg);
    expect(prismaMock.organization.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        ...updateData,
        status: {
          update: {
            last_update: expect.any(Date),
          },
        },
      },
      include: {
        status: true,
      },
    });
  });

  it('softDelete should set deleted_at and return updated record', async () => {
    const mockDeletedOrg = {
      id: '1',
      name: 'Test Org',
      category: 'NON_INDIVIDUAL' as const,
      tax_classification: 'VAT' as const,
      tin: null,
      subcategory: null,
      registration_date: null,
      address: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: new Date(),
    };
    (prismaMock.organization.update as jest.Mock).mockResolvedValue(
      mockDeletedOrg,
    );

    const result = await repository.softDelete('1');
    expect(result).toEqual(mockDeletedOrg);
    expect(prismaMock.organization.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { deleted_at: expect.any(Date) },
    });
  });
});
