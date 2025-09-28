/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method, @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { OrganizationService } from '../services/organization.service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationRequestDto } from '../dto/organization-request.dto';
import { Category, TaxClassification } from '@prisma/client';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let mockRepo: jest.Mocked<OrganizationRepository>;
  let mockHttpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    mockRepo = module.get(OrganizationRepository);
    mockHttpService = module.get(HttpService);
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

  afterEach(() => {
    // Reset NODE_ENV to test after each test
    process.env.NODE_ENV = 'test';
  });
});
