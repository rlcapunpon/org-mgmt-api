import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationSyncService } from './organization-sync.service';
import { PrismaService } from '../../database/prisma.service';
import { TaxClassification } from '@prisma/client';

describe('OrganizationSyncService', () => {
  let service: OrganizationSyncService;
  let mockPrisma: {
    organization: {
      update: jest.Mock;
      findUnique: jest.Mock;
    };
    organizationRegistration: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    mockPrisma = {
      organization: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      organizationRegistration: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationSyncService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<OrganizationSyncService>(OrganizationSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('syncOrganizationFromRegistration', () => {
    it('should sync TIN and tax classification when both are provided', async () => {
      const organizationId = 'org-123';
      const registrationData = {
        tin: '123456789000',
        tax_type: TaxClassification.VAT,
      };

      mockPrisma.organization.update.mockResolvedValue({
        id: organizationId,
        tin: '123456789000',
        tax_classification: TaxClassification.VAT,
      } as any);

      await service.syncOrganizationFromRegistration(
        organizationId,
        registrationData,
      );

      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: {
          tin: '123456789000',
          tax_classification: TaxClassification.VAT,
        },
      });
    });

    it('should sync only TIN when only TIN is provided', async () => {
      const organizationId = 'org-123';
      const registrationData = {
        tin: '123456789000',
      };

      mockPrisma.organization.update.mockResolvedValue({
        id: organizationId,
        tin: '123456789000',
      } as any);

      await service.syncOrganizationFromRegistration(
        organizationId,
        registrationData,
      );

      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: {
          tin: '123456789000',
        },
      });
    });

    it('should sync only tax classification when only tax_type is provided', async () => {
      const organizationId = 'org-123';
      const registrationData = {
        tax_type: TaxClassification.NON_VAT,
      };

      mockPrisma.organization.update.mockResolvedValue({
        id: organizationId,
        tax_classification: TaxClassification.NON_VAT,
      } as any);

      await service.syncOrganizationFromRegistration(
        organizationId,
        registrationData,
      );

      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: {
          tax_classification: TaxClassification.NON_VAT,
        },
      });
    });

    it('should not update when no relevant fields are provided', async () => {
      const organizationId = 'org-123';
      const registrationData = {};

      await service.syncOrganizationFromRegistration(
        organizationId,
        registrationData,
      );

      expect(mockPrisma.organization.update).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const organizationId = 'org-123';
      const registrationData = {
        tin: '123456789000',
      };

      mockPrisma.organization.update.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.syncOrganizationFromRegistration(organizationId, registrationData),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('validateOrganizationSync', () => {
    it('should return valid when TIN and tax classification match', async () => {
      const organizationId = 'org-123';

      mockPrisma.organization.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_classification: TaxClassification.VAT,
      } as any);

      mockPrisma.organizationRegistration.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_type: TaxClassification.VAT,
      } as any);

      const result = await service.validateOrganizationSync(organizationId);

      expect(result).toEqual({
        isValid: true,
        tinMatch: true,
        taxClassificationMatch: true,
        organization: {
          tin: '123456789000',
          tax_classification: TaxClassification.VAT,
        },
        registration: {
          tin: '123456789000',
          tax_type: TaxClassification.VAT,
        },
      });
    });

    it('should return invalid when TIN does not match', async () => {
      const organizationId = 'org-123';

      mockPrisma.organization.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_classification: TaxClassification.VAT,
      } as any);

      mockPrisma.organizationRegistration.findUnique.mockResolvedValue({
        tin: '987654321000',
        tax_type: TaxClassification.VAT,
      } as any);

      const result = await service.validateOrganizationSync(organizationId);

      expect(result).toEqual({
        isValid: false,
        tinMatch: false,
        taxClassificationMatch: true,
        organization: {
          tin: '123456789000',
          tax_classification: TaxClassification.VAT,
        },
        registration: {
          tin: '987654321000',
          tax_type: TaxClassification.VAT,
        },
      });
    });

    it('should return invalid when tax classification does not match', async () => {
      const organizationId = 'org-123';

      mockPrisma.organization.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_classification: TaxClassification.VAT,
      } as any);

      mockPrisma.organizationRegistration.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_type: TaxClassification.NON_VAT,
      } as any);

      const result = await service.validateOrganizationSync(organizationId);

      expect(result).toEqual({
        isValid: false,
        tinMatch: true,
        taxClassificationMatch: false,
        organization: {
          tin: '123456789000',
          tax_classification: TaxClassification.VAT,
        },
        registration: {
          tin: '123456789000',
          tax_type: TaxClassification.NON_VAT,
        },
      });
    });

    it('should return valid when no registration exists', async () => {
      const organizationId = 'org-123';

      mockPrisma.organization.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_classification: TaxClassification.VAT,
      } as any);

      mockPrisma.organizationRegistration.findUnique.mockResolvedValue(null);

      const result = await service.validateOrganizationSync(organizationId);

      expect(result).toEqual({
        isValid: true,
        tinMatch: true,
        taxClassificationMatch: true,
        organization: {
          tin: '123456789000',
          tax_classification: TaxClassification.VAT,
        },
      });
    });

    it('should throw error when organization does not exist', async () => {
      const organizationId = 'non-existent';

      mockPrisma.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.validateOrganizationSync(organizationId),
      ).rejects.toThrow('Organization non-existent not found');
    });
  });

  describe('repairOrganizationSync', () => {
    it('should repair TIN and tax classification mismatches', async () => {
      const organizationId = 'org-123';

      // Mock validation to show mismatches
      mockPrisma.organization.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_classification: TaxClassification.VAT,
      } as any);

      mockPrisma.organizationRegistration.findUnique.mockResolvedValue({
        tin: '987654321000',
        tax_type: TaxClassification.NON_VAT,
      } as any);

      mockPrisma.organization.update.mockResolvedValue({
        id: organizationId,
        tin: '987654321000',
        tax_classification: TaxClassification.NON_VAT,
      } as any);

      const result = await service.repairOrganizationSync(organizationId);

      expect(result.repaired).toBe(true);
      expect(result.changes).toEqual([
        'TIN: 123456789000 → 987654321000',
        'Tax Classification: VAT → NON_VAT',
      ]);

      expect(mockPrisma.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: {
          tin: '987654321000',
          tax_classification: TaxClassification.NON_VAT,
        },
      });
    });

    it('should not repair when values are already synced', async () => {
      const organizationId = 'org-123';

      // Mock validation to show everything matches
      mockPrisma.organization.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_classification: TaxClassification.VAT,
      } as any);

      mockPrisma.organizationRegistration.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_type: TaxClassification.VAT,
      } as any);

      const result = await service.repairOrganizationSync(organizationId);

      expect(result.repaired).toBe(false);
      expect(result.changes).toEqual([]);
      expect(mockPrisma.organization.update).not.toHaveBeenCalled();
    });

    it('should not repair when no registration exists', async () => {
      const organizationId = 'org-123';

      mockPrisma.organization.findUnique.mockResolvedValue({
        tin: '123456789000',
        tax_classification: TaxClassification.VAT,
      } as any);

      mockPrisma.organizationRegistration.findUnique.mockResolvedValue(null);

      const result = await service.repairOrganizationSync(organizationId);

      expect(result.repaired).toBe(false);
      expect(result.changes).toEqual([]);
      expect(mockPrisma.organization.update).not.toHaveBeenCalled();
    });
  });
});