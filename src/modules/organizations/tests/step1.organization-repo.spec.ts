import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationRepository } from '../repositories/organization.repository';
import { PrismaClient } from '../../../../generated/prisma';

describe('OrganizationRepository', () => {
  let repository: OrganizationRepository;
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationRepository,
        {
          provide: PrismaClient,
          useValue: {
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
    prismaMock = module.get(PrismaClient);
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
    };
    prismaMock.organization.create.mockResolvedValue(mockOrg);

    const result = await repository.create(data);
    expect(result).toEqual(mockOrg);
    expect(prismaMock.organization.create).toHaveBeenCalledWith({ data });
  });

  it('getOrganizationById should return null for non-existing id', async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);

    const result = await repository.getById('non-existing');
    expect(result).toBeNull();
    expect(prismaMock.organization.findUnique).toHaveBeenCalledWith({ where: { id: 'non-existing' } });
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
      },
    ];
    prismaMock.organization.findMany.mockResolvedValue(mockOrgs);

    const result = await repository.list({ category: 'NON_INDIVIDUAL', tax_classification: 'VAT' });
    expect(result).toEqual(mockOrgs);
    expect(prismaMock.organization.findMany).toHaveBeenCalledWith({
      where: {
        deleted_at: null,
        category: 'NON_INDIVIDUAL',
        tax_classification: 'VAT',
      },
    });
  });
});