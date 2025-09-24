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
    await expect(repository.create({} as any)).rejects.toThrow('Required fields missing');
  });

  it('createOrganization should create a record and return the new org with id and timestamps', async () => {
    const data = {
      name: 'Test Org',
      category: 'NON_INDIVIDUAL' as const,
      tax_classification: 'VAT' as const,
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
        status: 'PENDING',
        last_update: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      operation: {
        id: 'operation-uuid',
        organization_id: 'uuid',
        fy_start: new Date(),
        fy_end: new Date(),
        vat_reg_effectivity: new Date(),
        registration_effectivity: new Date(),
        payroll_cut_off: ['15/30'],
        payment_cut_off: ['15/30'],
        quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
        has_foreign: false,
        accounting_method: 'ACCRUAL',
        last_update: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    };
    (prismaMock.organization.create as jest.Mock).mockResolvedValue(mockOrg);

    const result = await repository.create(data);
    expect(result).toEqual(mockOrg);
    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: {
        ...data,
        deleted_at: null,
        status: {
          create: {
            status: 'PENDING',
          },
        },
        operation: {
          create: {
            fy_start: expect.any(Date),
            fy_end: expect.any(Date),
            vat_reg_effectivity: expect.any(Date),
            registration_effectivity: expect.any(Date),
            payroll_cut_off: ['15/30'],
            payment_cut_off: ['15/30'],
            quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
            has_foreign: false,
            accounting_method: 'ACCRUAL',
          },
        },
      },
      include: {
        status: true,
        operation: true,
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
        operation: true,
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
          status: 'PENDING',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        operation: {
          id: 'operation-1',
          organization_id: '1',
          fy_start: new Date(),
          fy_end: new Date(),
          vat_reg_effectivity: new Date(),
          registration_effectivity: new Date(),
          payroll_cut_off: ['15/30'],
          payment_cut_off: ['15/30'],
          quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
          has_foreign: false,
          accounting_method: 'ACCRUAL',
          last_update: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      },
    ];
    (prismaMock.organization.findMany as jest.Mock).mockResolvedValue(mockOrgs);

    const result = await repository.list({ category: 'NON_INDIVIDUAL', tax_classification: 'VAT' });
    expect(result).toEqual(mockOrgs);
    expect(prismaMock.organization.findMany).toHaveBeenCalledWith({
      where: {
        deleted_at: null,
        category: 'NON_INDIVIDUAL',
        tax_classification: 'VAT',
      },
      include: {
        status: true,
        operation: true,
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
        status: 'PENDING',
        last_update: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      operation: {
        id: 'operation-1',
        organization_id: '1',
        fy_start: new Date(),
        fy_end: new Date(),
        vat_reg_effectivity: new Date(),
        registration_effectivity: new Date(),
        payroll_cut_off: ['15/30'],
        payment_cut_off: ['15/30'],
        quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
        has_foreign: false,
        accounting_method: 'ACCRUAL',
        last_update: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    };
    (prismaMock.organization.update as jest.Mock).mockResolvedValue(mockUpdatedOrg);

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
        operation: {
          update: {
            last_update: expect.any(Date),
          },
        },
      },
      include: {
        status: true,
        operation: true,
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
    (prismaMock.organization.update as jest.Mock).mockResolvedValue(mockDeletedOrg);

    const result = await repository.softDelete('1');
    expect(result).toEqual(mockDeletedOrg);
    expect(prismaMock.organization.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { deleted_at: expect.any(Date) } });
  });
});