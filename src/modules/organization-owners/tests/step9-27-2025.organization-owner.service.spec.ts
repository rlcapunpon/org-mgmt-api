import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationOwnerService } from '../services/organization-owner.service';
import { OrganizationOwnerRepository } from '../repositories/organization-owner.repository';
import { AssignOrganizationOwnerRequestDto } from '../dto/organization-owner.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('OrganizationOwnerService', () => {
  let service: OrganizationOwnerService;
  let mockRepository: jest.Mocked<OrganizationOwnerRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationOwnerService,
        {
          provide: OrganizationOwnerRepository,
          useValue: {
            assignOwner: jest.fn(),
            getOwnersByOrgId: jest.fn(),
            isOwner: jest.fn(),
            removeOwner: jest.fn(),
            removeOwnerById: jest.fn(),
            updateLastUpdate: jest.fn(),
            getOwnerById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationOwnerService>(OrganizationOwnerService);
    mockRepository = module.get(OrganizationOwnerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignOwner', () => {
    it('should assign owner successfully when user is not already an owner', async () => {
      const dto: AssignOrganizationOwnerRequestDto = {
        org_id: 'org-123',
        user_id: 'user-456',
      };

      const mockOwner = {
        id: 'owner-1',
        org_id: 'org-123',
        user_id: 'user-456',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      mockRepository.isOwner.mockResolvedValue(false);
      mockRepository.assignOwner.mockResolvedValue(mockOwner);

      const result = await service.assignOwner(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.isOwner).toHaveBeenCalledWith(
        'org-123',
        'user-456',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.assignOwner).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockOwner);
    });

    it('should throw ConflictException when user is already an owner', async () => {
      const dto: AssignOrganizationOwnerRequestDto = {
        org_id: 'org-123',
        user_id: 'user-456',
      };

      mockRepository.isOwner.mockResolvedValue(true);

      await expect(service.assignOwner(dto)).rejects.toThrow(ConflictException);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.isOwner).toHaveBeenCalledWith(
        'org-123',
        'user-456',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.assignOwner).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when repository throws P2002 error', async () => {
      const dto: AssignOrganizationOwnerRequestDto = {
        org_id: 'org-123',
        user_id: 'user-456',
      };

      const error = { code: 'P2002' };
      mockRepository.isOwner.mockResolvedValue(false);
      mockRepository.assignOwner.mockRejectedValue(error);

      await expect(service.assignOwner(dto)).rejects.toThrow(ConflictException);
    });

    it('should rethrow other errors from repository', async () => {
      const dto: AssignOrganizationOwnerRequestDto = {
        org_id: 'org-123',
        user_id: 'user-456',
      };

      const error = new Error('Database error');
      mockRepository.isOwner.mockResolvedValue(false);
      mockRepository.assignOwner.mockRejectedValue(error);

      await expect(service.assignOwner(dto)).rejects.toThrow('Database error');
    });
  });

  describe('getOwnersByOrgId', () => {
    it('should return owners for organization', async () => {
      const mockOwners = [
        {
          id: 'owner-1',
          org_id: 'org-123',
          user_id: 'user-456',
          assigned_date: new Date(),
          last_update: new Date(),
        },
      ];

      mockRepository.getOwnersByOrgId.mockResolvedValue(mockOwners);

      const result = await service.getOwnersByOrgId('org-123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.getOwnersByOrgId).toHaveBeenCalledWith('org-123');
      expect(result).toEqual(mockOwners);
    });
  });

  describe('isOwner', () => {
    it('should return true when user is owner', async () => {
      mockRepository.isOwner.mockResolvedValue(true);

      const result = await service.isOwner('org-123', 'user-456');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.isOwner).toHaveBeenCalledWith(
        'org-123',
        'user-456',
      );
      expect(result).toBe(true);
    });

    it('should return false when user is not owner', async () => {
      mockRepository.isOwner.mockResolvedValue(false);

      const result = await service.isOwner('org-123', 'user-456');

      expect(result).toBe(false);
    });
  });

  describe('checkOwnership', () => {
    it('should return ownership check result', async () => {
      mockRepository.isOwner.mockResolvedValue(true);

      const result = await service.checkOwnership('org-123', 'user-456');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.isOwner).toHaveBeenCalledWith(
        'org-123',
        'user-456',
      );
      expect(result).toEqual({
        is_owner: true,
        org_id: 'org-123',
        user_id: 'user-456',
      });
    });
  });

  describe('removeOwner', () => {
    it('should remove owner successfully', async () => {
      const mockRemovedOwner = {
        id: 'owner-1',
        org_id: 'org-123',
        user_id: 'user-456',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      mockRepository.removeOwner.mockResolvedValue(mockRemovedOwner);

      const result = await service.removeOwner('org-123', 'user-456');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.removeOwner).toHaveBeenCalledWith(
        'org-123',
        'user-456',
      );
      expect(result).toEqual(mockRemovedOwner);
    });

    it('should throw NotFoundException when owner not found', async () => {
      const error = { code: 'P2025' };
      mockRepository.removeOwner.mockRejectedValue(error);

      await expect(service.removeOwner('org-123', 'user-456')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Database error');
      mockRepository.removeOwner.mockRejectedValue(error);

      await expect(service.removeOwner('org-123', 'user-456')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('removeOwnerById', () => {
    it('should remove owner by ID successfully', async () => {
      const mockRemovedOwner = {
        id: 'owner-1',
        org_id: 'org-123',
        user_id: 'user-456',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      mockRepository.removeOwnerById.mockResolvedValue(mockRemovedOwner);

      const result = await service.removeOwnerById('owner-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.removeOwnerById).toHaveBeenCalledWith('owner-1');
      expect(result).toEqual(mockRemovedOwner);
    });

    it('should throw NotFoundException when owner not found', async () => {
      const error = { code: 'P2025' };
      mockRepository.removeOwnerById.mockRejectedValue(error);

      await expect(service.removeOwnerById('owner-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLastUpdate', () => {
    it('should update last update timestamp successfully', async () => {
      const mockUpdatedOwner = {
        id: 'owner-1',
        org_id: 'org-123',
        user_id: 'user-456',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      mockRepository.updateLastUpdate.mockResolvedValue(mockUpdatedOwner);

      const result = await service.updateLastUpdate('org-123', 'user-456');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.updateLastUpdate).toHaveBeenCalledWith(
        'org-123',
        'user-456',
      );
      expect(result).toEqual(mockUpdatedOwner);
    });

    it('should throw NotFoundException when owner not found', async () => {
      const error = { code: 'P2025' };
      mockRepository.updateLastUpdate.mockRejectedValue(error);

      await expect(
        service.updateLastUpdate('org-123', 'user-456'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOwnerById', () => {
    it('should return owner by ID', async () => {
      const mockOwner = {
        id: 'owner-1',
        org_id: 'org-123',
        user_id: 'user-456',
        assigned_date: new Date(),
        last_update: new Date(),
      };

      mockRepository.getOwnerById.mockResolvedValue(mockOwner);

      const result = await service.getOwnerById('owner-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.getOwnerById).toHaveBeenCalledWith('owner-1');
      expect(result).toEqual(mockOwner);
    });

    it('should return null when owner not found', async () => {
      mockRepository.getOwnerById.mockResolvedValue(null);

      const result = await service.getOwnerById('owner-1');

      expect(result).toBeNull();
    });
  });
});
