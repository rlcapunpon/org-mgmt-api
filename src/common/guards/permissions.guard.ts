import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRES_PERMISSION } from '../decorators/requires-permission.decorator';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      REQUIRES_PERMISSION,
      context.getHandler(),
    );
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) return false;

    // Super admin bypass - support both isSuperAdmin boolean and role string
    if (
      user.isSuperAdmin ||
      user.role === 'Super Admin' ||
      user.permissions?.includes('*')
    )
      return true;

    // Get the actual permission to check (may include org ID)
    const permissionToCheck = this.resolvePermission(
      requiredPermission,
      request,
    );

    // Check if user has the exact permission
    if (user.permissions?.includes(permissionToCheck)) return true;

    // Check for org-scoped permissions
    const [resourceAction, scope] = permissionToCheck.split(':');
    if (scope && scope !== '*') {
      // Required permission is org-scoped (e.g., "organization.read:orgId")
      const wildcardPermission = `${resourceAction}:*`;
      if (user.permissions?.includes(wildcardPermission)) return true;

      // Check if user has permission for this specific org
      const userPermission = user.permissions?.find((perm: string) =>
        perm.startsWith(`${resourceAction}:`),
      );
      if (userPermission) {
        const [, userScope] = userPermission.split(':');
        if (userScope === scope) return true;
      }
    } else {
      // Required permission is not org-scoped, check if user has any matching permission
      const hasMatchingPermission = user.permissions?.some((perm: string) => {
        const [userResourceAction] = perm.split(':');
        return userResourceAction === resourceAction;
      });
      if (hasMatchingPermission) return true;
    }

    return false;
  }

  private resolvePermission(
    requiredPermission: string,
    request: AuthenticatedRequest,
  ): string {
    // If permission contains :id or :orgId, replace with actual org ID from params
    if (
      requiredPermission.includes(':id') ||
      requiredPermission.includes(':orgId')
    ) {
      const orgId = request.params.id || request.params.orgId;
      return requiredPermission.replace(/:id|:orgId/g, `:${orgId}`);
    }
    return requiredPermission;
  }
}
