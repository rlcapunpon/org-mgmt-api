import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface UserResource {
  resourceId: string;
  role: string;
}

export interface UserResourcesResponse {
  resources: UserResource[];
  totalCount: number;
}

export interface RolePermissions {
  role: string;
  permissions: string[];
}

export interface PermissionCheckRequest {
  userId: string;
  permission: string;
  resourceId: string;
}

export interface PermissionCheckResponse {
  hasPermission: boolean;
  userPermissions: string[];
  checkedPermission: string;
  resourceId: string;
  reason?: string;
}

@Injectable()
export class RbacUtilityService {
  private readonly logger = new Logger(RbacUtilityService.name);

  constructor(
    private readonly httpService: HttpService,
  ) {}

  /**
   * Get all resources that a user has access to from the RBAC API
   * @param userId - The user ID to get resources for
   * @param token - JWT token for authentication
   * @returns Promise<UserResourcesResponse> - User's accessible resources
   */
  async getUserResources(userId: string, token: string): Promise<UserResourcesResponse> {
    try {
      const rbacApiUrl = process.env.RBAC_API_URL || 'http://localhost:3000/api';
      const url = `${rbacApiUrl}/auth/me`;

      this.logger.debug(`Fetching user resources for userId: ${userId} from ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const userData = response.data;
      const resources: UserResource[] = userData.resources || [];

      this.logger.debug(`Retrieved ${resources.length} resources for user ${userId}`);

      return {
        resources,
        totalCount: resources.length,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch user resources for userId: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get permissions available for a specific role name
   * @param roleName - The role name to get permissions for
   * @param token - JWT token for authentication
   * @returns Promise<RolePermissions> - Role permissions mapping
   */
  async getRolePermissions(roleName: string, token: string): Promise<RolePermissions> {
    try {
      const rbacApiUrl = process.env.RBAC_API_URL || 'http://localhost:3000/api';
      const url = `${rbacApiUrl}/roles`;

      this.logger.debug(`Fetching permissions for role: ${roleName} from ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const roles: any[] = response.data;
      const role = roles.find(r => r.name === roleName);

      if (!role) {
        this.logger.warn(`Role with name ${roleName} not found`);
        return { role: roleName, permissions: [] };
      }

      this.logger.debug(`Retrieved permissions for role ${roleName}: ${role.permissions.join(', ')}`);

      return {
        role: role.name,
        permissions: role.permissions,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch permissions for role: ${roleName}`, error);
      throw error;
    }
  }

  /**
   * Check if a user has a specific permission on a resource
   * @param request - Permission check request
   * @param token - JWT token for authentication
   * @returns Promise<PermissionCheckResponse> - Permission check result
   */
  async checkUserPermission(request: PermissionCheckRequest, token: string): Promise<PermissionCheckResponse> {
    try {
      const rbacApiUrl = process.env.RBAC_API_URL || 'http://localhost:3000/api';
      const url = `${rbacApiUrl}/permissions/check`;

      this.logger.debug(`Checking permission for user ${request.userId} on resource ${request.resourceId}: ${request.permission}`);

      const response = await firstValueFrom(
        this.httpService.post<PermissionCheckResponse>(url, request, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      this.logger.debug(`Permission check result for user ${request.userId}: ${response.data.hasPermission ? 'GRANTED' : 'DENIED'}`);

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to check permission for user ${request.userId}`, error);
      throw error;
    }
  }

  /**
   * Determine the user's role based on their resources
   * @param userId - The user ID
   * @param token - JWT token for authentication
   * @returns Promise<string | null> - User's primary role or null
   */
  async getUserRole(userId: string, token: string): Promise<string | null> {
    try {
      const userResources = await this.getUserResources(userId, token);

      if (userResources.resources.length === 0) {
        this.logger.debug(`User ${userId} has no accessible resources`);
        return null;
      }

      // Define role hierarchy (higher index = higher privilege)
      const roleHierarchy = ['CLIENT', 'STAFF', 'APPROVER', 'SUPERADMIN'];

      let highestRole: string | null = null;
      let highestRoleIndex = -1;

      for (const resource of userResources.resources) {
        if (resource.role) {
          const roleIndex = roleHierarchy.indexOf(resource.role.toUpperCase());
          if (roleIndex > highestRoleIndex) {
            highestRole = resource.role;
            highestRoleIndex = roleIndex;
          }
        }
      }

      this.logger.debug(`Determined primary role for user ${userId}: ${highestRole || 'NONE'}`);
      return highestRole;
    } catch (error) {
      this.logger.error(`Failed to determine role for user ${userId}`, error);
      throw error;
    }
  }
}