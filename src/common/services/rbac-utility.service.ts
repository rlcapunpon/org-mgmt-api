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
      // For user-specific resource access, use /auth/me endpoint
      // This endpoint returns user profile with resources the user has access to
      const rbacApiUrl = process.env.RBAC_API_URL || 'http://localhost:3000/api';
      const url = `${rbacApiUrl}/auth/me`;

      // Debug log the request details
      this.logger.debug(`[GET /organizations] RBAC: Making API request for user ${userId}:`);
      this.logger.debug(`[GET /organizations] RBAC: URL: ${url}`);
      this.logger.debug(`[GET /organizations] RBAC: Method: GET`);
      this.logger.debug(`[GET /organizations] RBAC: Headers: Authorization: Bearer ${token.substring(0, 20)}... (masked)`);
      this.logger.debug(`[GET /organizations] RBAC: RBAC_API_URL env var: ${process.env.RBAC_API_URL || 'not set (using default)'}`);

      this.logger.debug(`[GET /organizations] RBAC: Fetching user resources for userId: ${userId} from ${url}`);

      const startTime = Date.now();
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      const endTime = Date.now();

      this.logger.debug(`[GET /organizations] RBAC: API request completed in ${endTime - startTime}ms`);
      this.logger.debug(`[GET /organizations] RBAC: Response status: ${response.status}`);

      const userData = response.data;

      this.logger.debug(`[GET /organizations] RBAC: Raw response data structure:`, Object.keys(userData));
      this.logger.debug(`[GET /organizations] RBAC: Response data type for 'resources' field: ${Array.isArray(userData.resources) ? 'array' : typeof userData.resources}`);

      // Handle the RBAC API /auth/me response format
      let resources: UserResource[] = [];

      if (userData.resources && Array.isArray(userData.resources)) {
        this.logger.debug(`[GET /organizations] RBAC: Processing ${userData.resources.length} total resources from RBAC API`);

        // /auth/me returns user-accessible resources directly in resources array
        // All resources in this array are already user-specific, no additional filtering needed
        resources = userData.resources.map((item: any) => ({
          resourceId: item.resourceId,
          role: item.role,
        }));

        this.logger.log(`[GET /organizations] RBAC: Found ${resources.length} resources for user from /auth/me endpoint`);
      } else {
        this.logger.warn(`[GET /organizations] RBAC: Unexpected RBAC API response format for user ${userId}:`, userData);
        this.logger.warn(`[GET /organizations] RBAC: Expected userData.resources to be an array, but got:`, typeof userData.resources);
        resources = [];
      }

      // Validate resource structure
      const validResources = resources.filter(resource => {
        if (!resource.resourceId) {
          this.logger.warn(`[GET /organizations] RBAC: Resource missing resourceId for user ${userId}:`, resource);
          return false;
        }
        return true;
      });

      // Log the full response from RBAC API
      this.logger.log(`[GET /organizations] RBAC: Complete RBAC API response for user ${userId}:`, JSON.stringify(userData, null, 2));
      this.logger.log(`[GET /organizations] RBAC: User ${userId} has access to ${validResources.length} resources:`, validResources.map(r => `ID: ${r.resourceId}, Role: ${r.role}`).join('; '));

      this.logger.debug(`[GET /organizations] RBAC: Retrieved ${validResources.length} valid resources for user ${userId}`);

      const result = {
        resources: validResources,
        totalCount: validResources.length,
      };

      this.logger.log(`[GET /organizations] RBAC: Returning UserResourcesResponse:`, JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      this.logger.error(`[GET /organizations] RBAC: Failed to fetch user resources for userId: ${userId}`, error);
      this.logger.error(`[GET /organizations] RBAC: Error details:`, {
        message: (error as Error).message,
        stack: (error as Error).stack,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
      });
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

  /**
   * Get all available roles from the RBAC API
   * @param token - JWT token for authentication
   * @returns Promise<AvailableRole[]> - List of available roles
   */
  async getAvailableRoles(token: string): Promise<any[]> {
    try {
      const rbacApiUrl = process.env.RBAC_API_URL || 'http://localhost:3000/api';
      const url = `${rbacApiUrl}/roles/available`;

      this.logger.debug(`Getting available roles from ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      this.logger.debug(`Retrieved ${response.data.length} available roles`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get available roles', error);
      throw error;
    }
  }

  /**
   * Assign a role to a user for a specific resource
   * @param userId - The user ID to assign the role to
   * @param roleId - The role ID to assign
   * @param resourceId - The resource ID
   * @param token - JWT token for authentication
   * @returns Promise<any> - Assignment result
   */
  async assignRole(userId: string, roleId: string, resourceId: string, token: string): Promise<any> {
    try {
      const rbacApiUrl = process.env.RBAC_API_URL || 'http://localhost:3000/api';
      const url = `${rbacApiUrl}/resources/assign-role`;

      const requestBody = {
        userId,
        roleId,
        resourceId,
      };

      this.logger.debug(`Assigning role ${roleId} to user ${userId} for resource ${resourceId}`);

      const response = await firstValueFrom(
        this.httpService.post(url, requestBody, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.debug(`Successfully assigned role to user ${userId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to assign role to user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Revoke a role from a user for a specific resource
   * @param userId - The user ID to revoke the role from
   * @param roleId - The role ID to revoke
   * @param resourceId - The resource ID
   * @param token - JWT token for authentication
   * @returns Promise<void> - Revocation result
   */
  async revokeRole(userId: string, roleId: string, resourceId: string, token: string): Promise<void> {
    try {
      const rbacApiUrl = process.env.RBAC_API_URL || 'http://localhost:3000/api';
      const url = `${rbacApiUrl}/resources/revoke-role`;

      const requestBody = {
        userId,
        roleId,
        resourceId,
      };

      this.logger.debug(`Revoking role ${roleId} from user ${userId} for resource ${resourceId}`);

      await firstValueFrom(
        this.httpService.post(url, requestBody, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.debug(`Successfully revoked role from user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to revoke role from user ${userId}`, error);
      throw error;
    }
  }
}