/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method, @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { OrganizationService } from '../services/organization.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { OrganizationSyncService } from '../../../common/services/organization-sync.service';
import { RbacUtilityService } from '../../../common/services/rbac-utility.service';
import { CreateOrganizationRequestDto } from '../dto/organization-request.dto';
import { Category, TaxClassification } from '@prisma/client';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let mockRepo: jest.Mocked<OrganizationRepository>;
  let mockHttpService: jest.Mocked<HttpService>;
  let mockSyncService: jest.Mocked<OrganizationSyncService>;
  let mockRbacUtilityService: jest.Mocked<RbacUtilityService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: {
            create: jest.fn(),
            listBasic: jest.fn(),
            listBasicWithIds: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: OrganizationSyncService,
          useValue: {
            syncOrganizationFromRegistration: jest.fn(),
          },
        },
        {
          provide: RbacUtilityService,
          useValue: {
            getUserResources: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    mockRepo = module.get(OrganizationRepository);
    mockHttpService = module.get(HttpService);
    mockSyncService = module.get(OrganizationSyncService);
    mockRbacUtilityService = module.get(RbacUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockOrgData: CreateOrganizationRequestDto = {
      category: Category.INDIVIDUAL,
      tax_classification: TaxClassification.VAT,
      tin: '001234567890',
      registration_date: new Date('2024-01-01'),
      first_name: 'John',
      middle_name: null,
      last_name: 'Doe',
      trade_name: null,
      line_of_business: '6201',
      address_line: '123 Main Street',
      region: 'NCR',
      city: 'Makati',
      zip_code: '1223',
      rdo_code: '001',
      contact_number: '+639123456789',
      email_address: 'john.doe@example.com',
      start_date: new Date('2024-01-01'),
    };

    const mockCreatedOrg = {
      id: 'org-123',
      name: 'John Doe',
      category: Category.INDIVIDUAL,
      tax_classification: TaxClassification.VAT,
      tin: '001234567890',
      subcategory: null,
      registration_date: new Date('2024-01-01'),
      address: '123 Main Street, Makati, NCR, 1223',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    it('should create organization and call RBAC API when JWT token is provided', async () => {
      // Arrange
      const userId = 'user-123';
      const jwtToken = 'mock-jwt-token';
      const expectedRbacPayload = {
        id: 'org-123',
        name: 'John Doe',
        description: 'Organization John Doe (001234567890)',
      };

      mockRepo.create.mockResolvedValue(mockCreatedOrg);
      const mockResponse: AxiosResponse = {
        data: { id: 'resource-123' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      // Mock environment variables
      process.env.RBAC_API_URL = 'http://localhost:3000';
      process.env.NODE_ENV = 'development'; // Set to non-test to enable RBAC calls

      // Act
      const result = await service.create(mockOrgData, userId, jwtToken);

      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...mockOrgData,
        subcategory: null,
        update_by: userId,
      });
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'http://localhost:3000/resources',
        expectedRbacPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );
      expect(result).toEqual(mockCreatedOrg);
    });

    it('should create organization without calling RBAC API when JWT token is not provided', async () => {
      // Arrange
      const userId = 'user-123';

      mockRepo.create.mockResolvedValue(mockCreatedOrg);

      // Act
      const result = await service.create(mockOrgData, userId);

      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...mockOrgData,
        subcategory: null,
        update_by: userId,
      });
      expect(mockHttpService.post).not.toHaveBeenCalled();
      expect(result).toEqual(mockCreatedOrg);
    });

    it('should create organization and log error when RBAC API call fails', async () => {
      // Arrange
      const userId = 'user-123';
      const jwtToken = 'mock-jwt-token';
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Set NODE_ENV to non-test to enable RBAC calls
      process.env.NODE_ENV = 'development';

      mockRepo.create.mockResolvedValue(mockCreatedOrg);
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('RBAC API error')),
      );

      // Act
      const result = await service.create(mockOrgData, userId, jwtToken);

      // Assert
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockHttpService.post).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to create resource in RBAC API:',
        expect.any(Error),
      );
      expect(result).toEqual(mockCreatedOrg); // Should still return the created org

      consoleSpy.mockRestore();
    });
  });

  describe('list', () => {
    const mockFilters = { category: 'NON_INDIVIDUAL' };
    const mockUserId = 'user-123';
    const mockJwtToken = 'mock-jwt-token';

    beforeEach(() => {
      mockRepo.listBasic.mockClear();
      mockRepo.listBasicWithIds.mockClear();
      (mockRbacUtilityService.getUserResources as jest.Mock).mockClear();
    });

    it('should return all organizations for super admin user', async () => {
      const mockOrgs = [
        {
          id: 'org-1',
          name: 'Org 1',
          category: Category.NON_INDIVIDUAL,
          tax_classification: TaxClassification.VAT,
          tin: null,
          subcategory: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      ];

      mockRepo.listBasic.mockResolvedValue(mockOrgs);

      const result = await service.list(mockFilters, mockUserId, true, mockJwtToken);

      expect(mockRepo.listBasic).toHaveBeenCalledWith(mockFilters);
      expect(mockRepo.listBasic).toHaveBeenCalledTimes(1);
      expect(mockRbacUtilityService.getUserResources).not.toHaveBeenCalled();
      expect(result).toEqual(mockOrgs);
    });

    it('should return all organizations in test environment for non-super admin', async () => {
      // Set NODE_ENV to test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const mockOrgs = [
        {
          id: 'org-1',
          name: 'Org 1',
          category: Category.NON_INDIVIDUAL,
          tax_classification: TaxClassification.VAT,
          tin: null,
          subcategory: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      ];

      mockRepo.listBasic.mockResolvedValue(mockOrgs);

      const result = await service.list(mockFilters, mockUserId, false, mockJwtToken);

      expect(mockRepo.listBasic).toHaveBeenCalledWith(mockFilters);
      expect(mockRepo.listBasic).toHaveBeenCalledTimes(1);
      expect(mockRbacUtilityService.getUserResources).not.toHaveBeenCalled();
      expect(result).toEqual(mockOrgs);

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });

    it('should filter organizations by user accessible resources for non-super admin', async () => {
      // Set NODE_ENV to non-test to enable RBAC filtering
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockUserResources = {
        resources: [
          { resourceId: 'org-1', role: 'editor' },
          { resourceId: 'org-2', role: 'viewer' },
        ],
        totalCount: 2,
      };

      const mockFilteredOrgs = [
        {
          id: 'org-1',
          name: 'Org 1',
          category: Category.NON_INDIVIDUAL,
          tax_classification: TaxClassification.VAT,
          tin: null,
          subcategory: null,
          registration_date: null,
          address: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      ];

      (mockRbacUtilityService.getUserResources as jest.Mock).mockResolvedValue(mockUserResources);
      mockRepo.listBasicWithIds.mockResolvedValue(mockFilteredOrgs);

      const result = await service.list(mockFilters, mockUserId, false, mockJwtToken);

      expect(mockRbacUtilityService.getUserResources).toHaveBeenCalledWith(mockUserId, mockJwtToken);
      expect(mockRepo.listBasicWithIds).toHaveBeenCalledWith(mockFilters, ['org-1', 'org-2']);
      expect(result).toEqual(mockFilteredOrgs);

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });

    it('should return empty array when user has no accessible resources', async () => {
      // Set NODE_ENV to non-test to enable RBAC filtering
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockUserResources = {
        resources: [],
        totalCount: 0,
      };

      (mockRbacUtilityService.getUserResources as jest.Mock).mockResolvedValue(mockUserResources);

      const result = await service.list(mockFilters, mockUserId, false, mockJwtToken);

      expect(mockRbacUtilityService.getUserResources).toHaveBeenCalledWith(mockUserId, mockJwtToken);
      expect(mockRepo.listBasicWithIds).not.toHaveBeenCalled();
      expect(result).toEqual([]);

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });

    it('should return empty array and log warning when RBAC API fails', async () => {
      // Set NODE_ENV to non-test to enable RBAC filtering
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      (mockRbacUtilityService.getUserResources as jest.Mock).mockRejectedValue(new Error('RBAC API unavailable'));

      const result = await service.list(mockFilters, mockUserId, false, mockJwtToken);

      expect(mockRbacUtilityService.getUserResources).toHaveBeenCalledWith(mockUserId, mockJwtToken);
      expect(mockRepo.listBasicWithIds).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        `[GET /organizations] SERVICE: Failed to fetch permissions for user ${mockUserId}:`,
        'RBAC API unavailable',
      );
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });
  });

  afterEach(() => {
    // Reset NODE_ENV to test after each test
    process.env.NODE_ENV = 'test';
  });
});
