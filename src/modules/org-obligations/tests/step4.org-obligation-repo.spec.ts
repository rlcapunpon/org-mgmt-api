import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationObligationRepository } from '../repositories/organization-obligation.repository';
import { PrismaService } from '../../../database/prisma.service';

describe('OrganizationObligationRepository', () => {
  let repository: OrganizationObligationRepository;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationObligationRepository,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            organizationObligation: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OrganizationObligationRepository>(OrganizationObligationRepository);
    prismaMock = module.get(PrismaService);
  });

  it('create should fail when required fields missing', async () => {
    await expect(repository.create({} as any)).rejects.toThrow('Required fields missing');
  });

  it('create should assign obligation and return the new assignment', async () => {
    const data = {
      start_date: new Date('2025-01-01'),
      organization: { connect: { id: 'org1' } },
      obligation: { connect: { id: 'obl1' } },
    };
    const mockAssignment = {
      id: '1',
      organization_id: 'org1',
      obligation_id: 'obl1',
      start_date: new Date('2025-01-01'),
      end_date: null,
      status: 'ACTIVE' as const,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    (prismaMock.organizationObligation.create as jest.Mock).mockResolvedValue(mockAssignment);

    const result = await repository.create(data);
    expect(result).toEqual(mockAssignment);
    expect(prismaMock.organizationObligation.create).toHaveBeenCalledWith({ data });
  });

  it('findByOrgId should return obligations for organization', async () => {
    const mockAssignments = [
      {
        id: '1',
        organization_id: 'org1',
        obligation_id: 'obl1',
        start_date: new Date('2025-01-01'),
        end_date: null,
        status: 'ACTIVE' as const,
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
        obligation: { id: 'obl1', code: '2550M', name: 'Monthly VAT' },
      },
    ];
    (prismaMock.organizationObligation.findMany as jest.Mock).mockResolvedValue(mockAssignments);

    const result = await repository.findByOrgId('org1');
    expect(result).toEqual(mockAssignments);
    expect(prismaMock.organizationObligation.findMany).toHaveBeenCalledWith({
      where: { organization_id: 'org1' },
      include: { obligation: true },
    });
  });

  it('findById should return null for non-existing id', async () => {
    (prismaMock.organizationObligation.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.findById('non-existing');
    expect(result).toBeNull();
    expect(prismaMock.organizationObligation.findUnique).toHaveBeenCalledWith({
      where: { id: 'non-existing' },
      include: { obligation: true, organization: true },
    });
  });

  it('update should update obligation assignment', async () => {
    const updateData = { status: 'EXEMPT' as const };
    const mockUpdated = {
      id: '1',
      organization_id: 'org1',
      obligation_id: 'obl1',
      start_date: new Date('2025-01-01'),
      end_date: null,
      status: 'EXEMPT' as const,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    (prismaMock.organizationObligation.update as jest.Mock).mockResolvedValue(mockUpdated);

    const result = await repository.update('1', updateData);
    expect(result).toEqual(mockUpdated);
    expect(prismaMock.organizationObligation.update).toHaveBeenCalledWith({ where: { id: '1' }, data: updateData });
  });
});
