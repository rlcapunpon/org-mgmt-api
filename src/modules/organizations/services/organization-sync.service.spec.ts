import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { OrganizationSyncService } from '../../../common/services/organization-sync.service';
import { UpdateOrganizationRegistrationRequestDto } from '../dto/organization-request.dto';
import { TaxClassification } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('OrganizationService - Registration Sync', () => {
  let service: OrganizationService;
  let mockRepo: {
    updateRegistration: jest.Mock;
  };
  let mockSyncService: {
    syncOrganizationFromRegistration: jest.Mock;
  };
  let mockHttpService: {
    post: jest.Mock;
  };

  beforeEach(async () => {
    mockRepo = {
      updateRegistration: jest.fn(),
    };

    mockSyncService = {
      syncOrganizationFromRegistration: jest.fn(),
    };

    mockHttpService = {
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: mockRepo,
        },
        {
          provide: OrganizationSyncService,
          useValue: mockSyncService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateRegistration', () => {
    it('should update registration and sync TIN when TIN is provided', async () => {
      const organizationId = 'org-123';
      const updateData: UpdateOrganizationRegistrationRequestDto = {
        tin: '123456789000',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockRegistration = {
        organization_id: organizationId,
        tin: '123456789000',
        first_name: 'John',
        last_name: 'Doe',
      };

      mockRepo.updateRegistration.mockResolvedValue(mockRegistration);
      mockSyncService.syncOrganizationFromRegistration.mockResolvedValue(undefined);

      const result = await service.updateRegistration(organizationId, updateData);

      expect(mockRepo.updateRegistration).toHaveBeenCalledWith(organizationId, updateData);
      expect(mockSyncService.syncOrganizationFromRegistration).toHaveBeenCalledWith(
        organizationId,
        {
          tin: '123456789000',
          tax_type: undefined,
        },
      );
      expect(result).toEqual(mockRegistration);
    });

    it('should update registration and sync tax_type when tax_type is provided', async () => {
      const organizationId = 'org-123';
      const updateData: UpdateOrganizationRegistrationRequestDto = {
        tax_type: TaxClassification.NON_VAT,
        line_of_business: '6202',
      };

      const mockRegistration = {
        organization_id: organizationId,
        tax_type: TaxClassification.NON_VAT,
        line_of_business: '6202',
      };

      mockRepo.updateRegistration.mockResolvedValue(mockRegistration);
      mockSyncService.syncOrganizationFromRegistration.mockResolvedValue(undefined);

      const result = await service.updateRegistration(organizationId, updateData);

      expect(mockRepo.updateRegistration).toHaveBeenCalledWith(organizationId, updateData);
      expect(mockSyncService.syncOrganizationFromRegistration).toHaveBeenCalledWith(
        organizationId,
        {
          tin: undefined,
          tax_type: TaxClassification.NON_VAT,
        },
      );
      expect(result).toEqual(mockRegistration);
    });

    it('should update registration and sync both TIN and tax_type when both are provided', async () => {
      const organizationId = 'org-123';
      const updateData: UpdateOrganizationRegistrationRequestDto = {
        tin: '987654321000',
        tax_type: TaxClassification.EXCEMPT,
        contact_number: '+639987654321',
      };

      const mockRegistration = {
        organization_id: organizationId,
        tin: '987654321000',
        tax_type: TaxClassification.EXCEMPT,
        contact_number: '+639987654321',
      };

      mockRepo.updateRegistration.mockResolvedValue(mockRegistration);
      mockSyncService.syncOrganizationFromRegistration.mockResolvedValue(undefined);

      const result = await service.updateRegistration(organizationId, updateData);

      expect(mockRepo.updateRegistration).toHaveBeenCalledWith(organizationId, updateData);
      expect(mockSyncService.syncOrganizationFromRegistration).toHaveBeenCalledWith(
        organizationId,
        {
          tin: '987654321000',
          tax_type: TaxClassification.EXCEMPT,
        },
      );
      expect(result).toEqual(mockRegistration);
    });

    it('should update registration without syncing when TIN and tax_type are not provided', async () => {
      const organizationId = 'org-123';
      const updateData: UpdateOrganizationRegistrationRequestDto = {
        first_name: 'Jane',
        last_name: 'Smith',
        contact_number: '+639111222333',
      };

      const mockRegistration = {
        organization_id: organizationId,
        first_name: 'Jane',
        last_name: 'Smith',
        contact_number: '+639111222333',
      };

      mockRepo.updateRegistration.mockResolvedValue(mockRegistration);

      const result = await service.updateRegistration(organizationId, updateData);

      expect(mockRepo.updateRegistration).toHaveBeenCalledWith(organizationId, updateData);
      expect(mockSyncService.syncOrganizationFromRegistration).not.toHaveBeenCalled();
      expect(result).toEqual(mockRegistration);
    });

    it('should throw NotFoundException when repository throws P2025 error', async () => {
      const organizationId = 'non-existent-org';
      const updateData: UpdateOrganizationRegistrationRequestDto = {
        tin: '123456789000',
      };

      const error = new Error('Record to update not found.');
      (error as any).code = 'P2025';
      mockRepo.updateRegistration.mockRejectedValue(error);

      await expect(
        service.updateRegistration(organizationId, updateData),
      ).rejects.toThrow(NotFoundException);

      expect(mockRepo.updateRegistration).toHaveBeenCalledWith(organizationId, updateData);
      expect(mockSyncService.syncOrganizationFromRegistration).not.toHaveBeenCalled();
    });

    it('should propagate other repository errors without modification', async () => {
      const organizationId = 'org-123';
      const updateData: UpdateOrganizationRegistrationRequestDto = {
        tin: '123456789000',
      };

      const error = new Error('Database connection failed');
      mockRepo.updateRegistration.mockRejectedValue(error);

      await expect(
        service.updateRegistration(organizationId, updateData),
      ).rejects.toThrow('Database connection failed');

      expect(mockRepo.updateRegistration).toHaveBeenCalledWith(organizationId, updateData);
      expect(mockSyncService.syncOrganizationFromRegistration).not.toHaveBeenCalled();
    });

    it('should still return registration result even if sync fails', async () => {
      const organizationId = 'org-123';
      const updateData: UpdateOrganizationRegistrationRequestDto = {
        tin: '123456789000',
      };

      const mockRegistration = {
        organization_id: organizationId,
        tin: '123456789000',
      };

      mockRepo.updateRegistration.mockResolvedValue(mockRegistration);
      mockSyncService.syncOrganizationFromRegistration.mockRejectedValue(
        new Error('Sync service failed'),
      );

      await expect(
        service.updateRegistration(organizationId, updateData),
      ).rejects.toThrow('Sync service failed');

      expect(mockRepo.updateRegistration).toHaveBeenCalledWith(organizationId, updateData);
      expect(mockSyncService.syncOrganizationFromRegistration).toHaveBeenCalledWith(
        organizationId,
        {
          tin: '123456789000',
          tax_type: undefined,
        },
      );
    });
  });
});