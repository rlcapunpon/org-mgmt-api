import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as {
      permissions?: string[];
      isSuperAdmin?: boolean;
      role?: string;
    };

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user is super admin
    if (
      user.isSuperAdmin ||
      user.role === 'Super Admin' ||
      user.permissions?.includes('*')
    ) {
      return true;
    }

    throw new ForbiddenException('Super admin access required');
  }
}
