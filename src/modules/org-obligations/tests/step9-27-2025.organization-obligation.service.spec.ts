/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationObligationService } from '../services/organization-obligation.service';
import { OrganizationObligationRepository } from '../repositories/organization-obligation.repository';
import { OrganizationTaxObligationHistoryRepository } from '../repositories/organization-tax-obligation-history.repository';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationTaxObligationStatus } from '@prisma/client';

describe('OrganizationObligationService', () => {
  let service: OrganizationObligationService;
  let obligationRepoMock: jest.Mocked<OrganizationObligationRepository>;
  let historyRepoMock: jest.Mocked<OrganizationTaxObligationHistoryRepository>;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationObligationService,
        {
          provide: OrganizationObligationRepository,
          useValue: {
            create: jest.fn(),
            findByOrgId: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: OrganizationTaxObligationHistoryRepository,
          useValue: {
            createHistory: jest.fn(),
            findByOrgObligationId: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationObligationService>(
      OrganizationObligationService,
    );
    obligationRepoMock = module.get(OrganizationObligationRepository);
    historyRepoMock = module.get(OrganizationTaxObligationHistoryRepository);
    prismaMock = module.get(PrismaService);
  });

  it('assignObligation should create obligation and return it', async () => {
    const data = {
      organization: { connect: { id: 'org-uuid' } },
      obligation: { connect: { id: 'obligation-uuid' } },
      start_date: new Date(),
    };
    const mockObligation = {
      id: 'obligation-uuid',
      organization_id: 'org-uuid',
      obligation_id: 'obligation-uuid',
      start_date: new Date(),
      end_date: null,
      status: OrganizationTaxObligationStatus.ASSIGNED,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    (obligationRepoMock.create as jest.Mock).mockResolvedValue(mockObligation);

    const result = await service.assignObligation(data);
    expect(result).toEqual(mockObligation);
    expect(obligationRepoMock.create).toHaveBeenCalledWith(data);
  });

  it('getObligationsByOrgId should return obligations for organization', async () => {
    const mockObligations = [
      {
        id: 'obligation-1',
        organization_id: 'org-uuid',
        obligation_id: 'tax-uuid',
        start_date: new Date(),
        end_date: null,
        status: OrganizationTaxObligationStatus.ACTIVE,
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    (obligationRepoMock.findByOrgId as jest.Mock).mockResolvedValue(mockObligations);

    const result = await service.getObligationsByOrgId('org-uuid');
    expect(result).toEqual(mockObligations);
    expect(obligationRepoMock.findByOrgId).toHaveBeenCalledWith('org-uuid');
  });

  it('updateStatus should create history log and update obligation status', async () => {
    const obligationId = 'obligation-uuid';
    const newStatus = OrganizationTaxObligationStatus.ACTIVE;
    const updatedBy = 'user-uuid-123';

    const existingObligation = {
      id: obligationId,
      organization_id: 'org-uuid',
      obligation_id: 'tax-uuid',
      start_date: new Date(),
      end_date: null,
      status: OrganizationTaxObligationStatus.ASSIGNED,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedObligation = {
      ...existingObligation,
      status: newStatus,
      updated_at: new Date(),
    };

    const mockHistory = {
      id: 'history-uuid',
      org_obligation_id: obligationId,
      prev_status: OrganizationTaxObligationStatus.ASSIGNED,
      new_status: newStatus,
      desc: null,
      updated_at: new Date(),
      updated_by: updatedBy,
    };

    (obligationRepoMock.findById as jest.Mock).mockResolvedValue(existingObligation);
    (historyRepoMock.createHistory as jest.Mock).mockResolvedValue(mockHistory);
    (obligationRepoMock.update as jest.Mock).mockResolvedValue(updatedObligation);

    const result = await service.updateStatus(obligationId, newStatus, updatedBy);
    expect(result).toEqual(updatedObligation);
    expect(obligationRepoMock.findById).toHaveBeenCalledWith(obligationId);
    expect(historyRepoMock.createHistory).toHaveBeenCalledWith({
      org_obligation_id: obligationId,
      prev_status: OrganizationTaxObligationStatus.ASSIGNED,
      new_status: newStatus,
      desc: undefined,
      updated_by: updatedBy,
    });
    expect(obligationRepoMock.update).toHaveBeenCalledWith(obligationId, { status: newStatus });
  });

  it('updateStatus should create history log with description when provided', async () => {
    const obligationId = 'obligation-uuid';
    const newStatus = OrganizationTaxObligationStatus.PAID;
    const updatedBy = 'user-uuid-123';
    const description = 'Payment processed successfully';

    const existingObligation = {
      id: obligationId,
      organization_id: 'org-uuid',
      obligation_id: 'tax-uuid',
      start_date: new Date(),
      end_date: null,
      status: OrganizationTaxObligationStatus.FILED,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedObligation = {
      ...existingObligation,
      status: newStatus,
      updated_at: new Date(),
    };

    const mockHistory = {
      id: 'history-uuid',
      org_obligation_id: obligationId,
      prev_status: OrganizationTaxObligationStatus.FILE,
      new_status: newStatus,
      desc: description,
      updated_at: new Date(),
      updated_by: updatedBy,
    };

    (obligationRepoMock.findById as jest.Mock).mockResolvedValue(existingObligation);
    (historyRepoMock.createHistory as jest.Mock).mockResolvedValue(mockHistory);
    (obligationRepoMock.update as jest.Mock).mockResolvedValue(updatedObligation);

    const result = await service.updateStatus(obligationId, newStatus, updatedBy, description);
    expect(result).toEqual(updatedObligation);
    expect(historyRepoMock.createHistory).toHaveBeenCalledWith({
      org_obligation_id: obligationId,
      prev_status: OrganizationTaxObligationStatus.FILED,
      new_status: newStatus,
      desc: description,
      updated_by: updatedBy,
    });
  });

  it('updateStatus should throw NotFoundException when obligation not found', async () => {
    const obligationId = 'non-existent-uuid';
    const newStatus = OrganizationTaxObligationStatus.ACTIVE;
    const updatedBy = 'user-uuid-123';

    (obligationRepoMock.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.updateStatus(obligationId, newStatus, updatedBy)).rejects.toThrow(
      'Obligation not found',
    );
    expect(obligationRepoMock.findById).toHaveBeenCalledWith(obligationId);
    expect(historyRepoMock.createHistory).not.toHaveBeenCalled();
    expect(obligationRepoMock.update).not.toHaveBeenCalled();
  });

  it('findById should return obligation when found', async () => {
    const mockObligation = {
      id: 'obligation-uuid',
      organization_id: 'org-uuid',
      obligation_id: 'tax-uuid',
      start_date: new Date(),
      end_date: null,
      status: OrganizationTaxObligationStatus.ACTIVE,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    (obligationRepoMock.findById as jest.Mock).mockResolvedValue(mockObligation);

    const result = await service.findById('obligation-uuid');
    expect(result).toEqual(mockObligation);
    expect(obligationRepoMock.findById).toHaveBeenCalledWith('obligation-uuid');
  });
});