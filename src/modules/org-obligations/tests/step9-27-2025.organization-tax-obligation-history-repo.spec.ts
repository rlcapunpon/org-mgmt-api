/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationTaxObligationHistoryRepository } from '../repositories/organization-tax-obligation-history.repository';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationTaxObligationStatus } from '@prisma/client';

describe('OrganizationTaxObligationHistoryRepository', () => {
  let repository: OrganizationTaxObligationHistoryRepository;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationTaxObligationHistoryRepository,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            organizationTaxObligationHistory: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OrganizationTaxObligationHistoryRepository>(
      OrganizationTaxObligationHistoryRepository,
    );
    prismaMock = module.get(PrismaService);
  });

  it('createHistory should fail when required fields missing', async () => {
    await expect(repository.createHistory({} as any)).rejects.toThrow(
      'Required fields missing',
    );
  });

  it('createHistory should create history record and return it', async () => {
    const data = {
      org_obligation_id: 'org-obligation-uuid',
      prev_status: OrganizationTaxObligationStatus.ASSIGNED,
      new_status: OrganizationTaxObligationStatus.ACTIVE,
      desc: 'Status updated for compliance',
      updated_by: 'user-uuid-123',
    };
    const mockHistory = {
      id: 'history-uuid',
      org_obligation_id: 'org-obligation-uuid',
      prev_status: OrganizationTaxObligationStatus.ASSIGNED,
      new_status: OrganizationTaxObligationStatus.ACTIVE,
      desc: 'Status updated for compliance',
      updated_at: new Date(),
      updated_by: 'user-uuid-123',
    };
    (prismaMock.organizationTaxObligationHistory.create as jest.Mock).mockResolvedValue(
      mockHistory,
    );

    const result = await repository.createHistory(data);
    expect(result).toEqual(mockHistory);
    expect(prismaMock.organizationTaxObligationHistory.create).toHaveBeenCalledWith({
      data: {
        org_obligation_id: 'org-obligation-uuid',
        prev_status: OrganizationTaxObligationStatus.ASSIGNED,
        new_status: OrganizationTaxObligationStatus.ACTIVE,
        desc: 'Status updated for compliance',
        updated_by: 'user-uuid-123',
      },
    });
  });

  it('createHistory should create history record without description', async () => {
    const data = {
      org_obligation_id: 'org-obligation-uuid',
      prev_status: OrganizationTaxObligationStatus.ACTIVE,
      new_status: OrganizationTaxObligationStatus.DUE,
      updated_by: 'user-uuid-123',
    };
    const mockHistory = {
      id: 'history-uuid',
      org_obligation_id: 'org-obligation-uuid',
      prev_status: OrganizationTaxObligationStatus.ACTIVE,
      new_status: OrganizationTaxObligationStatus.DUE,
      desc: null,
      updated_at: new Date(),
      updated_by: 'user-uuid-123',
    };
    (prismaMock.organizationTaxObligationHistory.create as jest.Mock).mockResolvedValue(
      mockHistory,
    );

    const result = await repository.createHistory(data);
    expect(result).toEqual(mockHistory);
    expect(prismaMock.organizationTaxObligationHistory.create).toHaveBeenCalledWith({
      data: {
        org_obligation_id: 'org-obligation-uuid',
        prev_status: OrganizationTaxObligationStatus.ACTIVE,
        new_status: OrganizationTaxObligationStatus.DUE,
        desc: undefined,
        updated_by: 'user-uuid-123',
      },
    });
  });

  it('findByOrgObligationId should return empty array when no history exists', async () => {
    (prismaMock.organizationTaxObligationHistory.findMany as jest.Mock).mockResolvedValue([]);

    const result = await repository.findByOrgObligationId('org-obligation-uuid');
    expect(result).toEqual([]);
    expect(prismaMock.organizationTaxObligationHistory.findMany).toHaveBeenCalledWith({
      where: { org_obligation_id: 'org-obligation-uuid' },
      orderBy: { updated_at: 'desc' },
    });
  });

  it('findByOrgObligationId should return history records ordered by updated_at desc', async () => {
    const mockHistory = [
      {
        id: 'history-2',
        org_obligation_id: 'org-obligation-uuid',
        prev_status: OrganizationTaxObligationStatus.DUE,
        new_status: OrganizationTaxObligationStatus.PAID,
        desc: 'Payment processed',
        updated_at: new Date('2024-01-02'),
        updated_by: 'user-uuid-123',
      },
      {
        id: 'history-1',
        org_obligation_id: 'org-obligation-uuid',
        prev_status: OrganizationTaxObligationStatus.ACTIVE,
        new_status: OrganizationTaxObligationStatus.DUE,
        desc: null,
        updated_at: new Date('2024-01-01'),
        updated_by: 'user-uuid-123',
      },
    ];
    (prismaMock.organizationTaxObligationHistory.findMany as jest.Mock).mockResolvedValue(
      mockHistory,
    );

    const result = await repository.findByOrgObligationId('org-obligation-uuid');
    expect(result).toEqual(mockHistory);
    expect(prismaMock.organizationTaxObligationHistory.findMany).toHaveBeenCalledWith({
      where: { org_obligation_id: 'org-obligation-uuid' },
      orderBy: { updated_at: 'desc' },
    });
  });

  it('findById should return null when history record not found', async () => {
    (prismaMock.organizationTaxObligationHistory.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.findById('history-uuid');
    expect(result).toBeNull();
    expect(prismaMock.organizationTaxObligationHistory.findUnique).toHaveBeenCalledWith({
      where: { id: 'history-uuid' },
    });
  });

  it('findById should return history record when found', async () => {
    const mockHistory = {
      id: 'history-uuid',
      org_obligation_id: 'org-obligation-uuid',
      prev_status: OrganizationTaxObligationStatus.ASSIGNED,
      new_status: OrganizationTaxObligationStatus.ACTIVE,
      desc: 'Initial activation',
      updated_at: new Date(),
      updated_by: 'user-uuid-123',
    };
    (prismaMock.organizationTaxObligationHistory.findUnique as jest.Mock).mockResolvedValue(
      mockHistory,
    );

    const result = await repository.findById('history-uuid');
    expect(result).toEqual(mockHistory);
    expect(prismaMock.organizationTaxObligationHistory.findUnique).toHaveBeenCalledWith({
      where: { id: 'history-uuid' },
    });
  });
});