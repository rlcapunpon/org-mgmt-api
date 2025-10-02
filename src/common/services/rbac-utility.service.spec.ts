import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { RbacUtilityService, UserResourcesResponse, RolePermissions, PermissionCheckResponse } from './rbac-utility.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('RbacUtilityService', () => {
  let service: RbacUtilityService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacUtilityService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<RbacUtilityService>(RbacUtilityService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserResources', () => {
    it('should call RBAC API and return user resources', async () => {
      const userId = 'user-123';
      const token = 'jwt-token';
      const mockResponse: AxiosResponse<any> = {
        data: {
          id: userId,
          email: 'user@example.com',
          resources: [
            {
              resourceId: 'org-1',
              role: 'OWNER',
            },
            {
              resourceId: 'org-2',
              role: 'MEMBER',
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getUserResources(userId, token);

      expect(httpService.get).toHaveBeenCalledWith(
        `${process.env.RBAC_API_URL || 'http://localhost:3000/api'}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(result).toEqual({
        resources: [
          {
            resourceId: 'org-1',
            role: 'OWNER',
          },
          {
            resourceId: 'org-2',
            role: 'MEMBER',
          },
        ],
        totalCount: 2,
      });
    });

    it('should handle API errors gracefully', async () => {
      const userId = 'user-123';
      const token = 'jwt-token';
      const error = new Error('API Error');

      httpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getUserResources(userId, token)).rejects.toThrow('API Error');
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for a given role', async () => {
      const roleName = 'ADMIN';
      const token = 'jwt-token';
      const mockResponse: AxiosResponse<any[]> = {
        data: [
          {
            id: 'role-1',
            name: 'CLIENT',
            permissions: ['read:own', 'write:own'],
          },
          {
            id: 'role-2',
            name: 'ADMIN',
            permissions: ['read:users', 'write:users', 'delete:users', '*'],
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getRolePermissions(roleName, token);

      expect(httpService.get).toHaveBeenCalledWith(
        `${process.env.RBAC_API_URL || 'http://localhost:3000/api'}/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(result).toEqual({
        role: 'ADMIN',
        permissions: ['read:users', 'write:users', 'delete:users', '*'],
      });
    });

    it('should return empty permissions for unknown role', async () => {
      const roleName = 'UNKNOWN_ROLE';
      const token = 'jwt-token';
      const mockResponse: AxiosResponse<any[]> = {
        data: [
          {
            id: 'role-1',
            name: 'CLIENT',
            permissions: ['read:own', 'write:own'],
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getRolePermissions(roleName, token);

      expect(result).toEqual({
        role: 'UNKNOWN_ROLE',
        permissions: [],
      });
    });

    it('should handle API errors for role permissions', async () => {
      const roleName = 'ADMIN';
      const token = 'jwt-token';
      const error = new Error('Role not found');

      httpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getRolePermissions(roleName, token)).rejects.toThrow('Role not found');
    });
  });

  describe('checkUserPermission', () => {
    it('should check user permission via RBAC API', async () => {
      const request = {
        userId: 'user-123',
        permission: 'read:organization',
        resourceId: 'org-456',
      };
      const token = 'jwt-token';

      const mockResponse: AxiosResponse<PermissionCheckResponse> = {
        data: {
          hasPermission: true,
          userPermissions: ['read:organization', 'write:organization'],
          checkedPermission: 'read:organization',
          resourceId: 'org-456',
          reason: 'User has direct permission',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.checkUserPermission(request, token);

      expect(httpService.post).toHaveBeenCalledWith(
        `${process.env.RBAC_API_URL || 'http://localhost:3000/api'}/permissions/check`,
        request,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should return false when user does not have permission', async () => {
      const request = {
        userId: 'user-123',
        permission: 'delete:organization',
        resourceId: 'org-456',
      };
      const token = 'jwt-token';

      const mockResponse: AxiosResponse<PermissionCheckResponse> = {
        data: {
          hasPermission: false,
          userPermissions: ['read:organization'],
          checkedPermission: 'delete:organization',
          resourceId: 'org-456',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await service.checkUserPermission(request, token);

      expect(result.hasPermission).toBe(false);
      expect(result.userPermissions).toEqual(['read:organization']);
    });

    it('should handle API errors for permission checking', async () => {
      const request = {
        userId: 'user-123',
        permission: 'read:organization',
        resourceId: 'org-456',
      };
      const token = 'jwt-token';

      const error = new Error('Permission check failed');

      httpService.post.mockReturnValue(throwError(() => error));

      await expect(service.checkUserPermission(request, token)).rejects.toThrow('Permission check failed');
    });
  });

  describe('getUserRole', () => {
    it('should determine user role from resources', async () => {
      const userId = 'user-123';
      const token = 'jwt-token';
      const mockResourcesResponse: AxiosResponse<any> = {
        data: {
          id: userId,
          resources: [
            {
              resourceId: 'org-1',
              role: 'SUPERADMIN',
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResourcesResponse));

      const result = await service.getUserRole(userId, token);

      expect(result).toBe('SUPERADMIN');
    });

    it('should return null when user has no resources', async () => {
      const userId = 'user-123';
      const token = 'jwt-token';
      const mockResourcesResponse: AxiosResponse<any> = {
        data: {
          id: userId,
          resources: [],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResourcesResponse));

      const result = await service.getUserRole(userId, token);

      expect(result).toBeNull();
    });

    it('should prioritize higher privilege roles', async () => {
      const userId = 'user-123';
      const token = 'jwt-token';
      const mockResourcesResponse: AxiosResponse<any> = {
        data: {
          id: userId,
          resources: [
            {
              resourceId: 'org-1',
              role: 'CLIENT',
            },
            {
              resourceId: 'org-2',
              role: 'SUPERADMIN',
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResourcesResponse));

      const result = await service.getUserRole(userId, token);

      expect(result).toBe('SUPERADMIN'); // Should return the highest privilege role
    });
  });
});