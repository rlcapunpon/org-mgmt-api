import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    if (!requiredPermission) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    if (user.isSuperAdmin || user.permissions?.includes('*')) return true;
    return user.permissions?.includes(requiredPermission) || false;
  }
}