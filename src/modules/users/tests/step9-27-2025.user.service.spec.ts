import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { OrganizationOwnerRepository } from '../../organization-owners/repositories/organization-owner.repository';
import { OrganizationObligationRepository } from '../../org-obligations/repositories/organization-obligation.repository';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockOrganizationOwnerRepository: jest.Mocked<OrganizationOwnerRepository>;
  let mockOrganizationObligationRepository: jest.Mocked<OrganizationObligationRepository>;
  let mockHttpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            // Add mock methods as needed
          },
        },
        {
          provide: OrganizationOwnerRepository,
          useValue: {
            getOwnersByUserId: jest.fn(),
          },
        },
        {
          provide: OrganizationObligationRepository,
          useValue: {
            countObligationsDueWithinDays: jest.fn(),
            countTotalObligations: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserRepository = module.get(UserRepository);
    mockOrganizationOwnerRepository = module.get(OrganizationOwnerRepository);
    mockOrganizationObligationRepository = module.get(OrganizationObligationRepository);
    mockHttpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserOverview', () => {
    it('should return user overview with organizations owned, assigned, and obligations due', async () => {
      const userId = 'user-123';
      const userPermissions = ['organization.read:org-1', 'organization.write:org-2'];

      // Mock RBAC API response
      const rbacResponse: AxiosResponse = {
        data: {
          permissions: userPermissions,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpService.get.mockReturnValue(of(rbacResponse));

      // Mock owned organizations
      mockOrganizationOwnerRepository.getOwnersByUserId.mockResolvedValue([
        { id: 'owner-1', org_id: 'org-1', user_id: userId, assigned_date: new Date(), last_update: new Date() },
        { id: 'owner-2', org_id: 'org-3', user_id: userId, assigned_date: new Date(), last_update: new Date() },
      ]);

      // Mock obligations due within 30 days
      mockOrganizationObligationRepository.countObligationsDueWithinDays.mockResolvedValue(5);

      // Mock total obligations
      mockOrganizationObligationRepository.countTotalObligations.mockResolvedValue(15);

      const result = await service.getUserOverview(userId);

      expect(result).toEqual({
        organizationsOwned: 2,
        organizationsAssigned: 2, // org-1 and org-2 from permissions
        obligationsDueWithin30Days: 5,
        totalObligations: 15,
      });

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/permissions/check'),
        expect.objectContaining({
          params: { userId },
        })
      );
    });

    it('should handle SUPERADMIN users with access to all organizations', async () => {
      const userId = 'super-admin-123';

      // Mock RBAC API response for super admin
      const rbacResponse: AxiosResponse = {
        data: {
          permissions: ['*'], // Super admin has all permissions
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpService.get.mockReturnValue(of(rbacResponse));

      // Mock owned organizations
      mockOrganizationOwnerRepository.getOwnersByUserId.mockResolvedValue([
        { id: 'owner-1', org_id: 'org-1', user_id: userId, assigned_date: new Date(), last_update: new Date() },
      ]);

      // Mock obligations due within 30 days
      mockOrganizationObligationRepository.countObligationsDueWithinDays.mockResolvedValue(3);

      // Mock total obligations
      mockOrganizationObligationRepository.countTotalObligations.mockResolvedValue(10);

      const result = await service.getUserOverview(userId);

      expect(result).toEqual({
        organizationsOwned: 1,
        organizationsAssigned: -1, // -1 indicates all organizations for super admin
        obligationsDueWithin30Days: 3,
        totalObligations: 10,
      });
    });

    it('should handle users with no organizations assigned', async () => {
      const userId = 'user-no-orgs';

      // Mock RBAC API response with no organization permissions
      const rbacResponse: AxiosResponse = {
        data: {
          permissions: ['user.read', 'report.read'], // No organization permissions
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpService.get.mockReturnValue(of(rbacResponse));

      // Mock no owned organizations
      mockOrganizationOwnerRepository.getOwnersByUserId.mockResolvedValue([]);

      // Mock obligations due within 30 days
      mockOrganizationObligationRepository.countObligationsDueWithinDays.mockResolvedValue(0);

      // Mock total obligations
      mockOrganizationObligationRepository.countTotalObligations.mockResolvedValue(0);

      const result = await service.getUserOverview(userId);

      expect(result).toEqual({
        organizationsOwned: 0,
        organizationsAssigned: 0,
        obligationsDueWithin30Days: 0,
        totalObligations: 0,
      });
    });

    it('should handle RBAC API errors gracefully', async () => {
      const userId = 'user-123';

      // Mock RBAC API error
      mockHttpService.get.mockImplementation(() => {
        throw new Error('RBAC API unavailable');
      });

      // Should still work with owned organizations
      mockOrganizationOwnerRepository.getOwnersByUserId.mockResolvedValue([
        { id: 'owner-1', org_id: 'org-1', user_id: userId, assigned_date: new Date(), last_update: new Date() },
      ]);

      mockOrganizationObligationRepository.countObligationsDueWithinDays.mockResolvedValue(2);
      mockOrganizationObligationRepository.countTotalObligations.mockResolvedValue(8);

      const result = await service.getUserOverview(userId);

      expect(result).toEqual({
        organizationsOwned: 1,
        organizationsAssigned: 0, // Default to 0 on API error
        obligationsDueWithin30Days: 2,
        totalObligations: 8,
      });
    });
  });
});