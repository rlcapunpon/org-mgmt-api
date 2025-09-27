import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { UserService, UserOverview } from '../services/user.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequiresPermission } from '../../../common/decorators/requires-permission.decorator';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../../../common/interfaces/auth.interface';

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('overview')
  @RequiresPermission('user.read')
  async getUserOverview(@Req() req: AuthenticatedRequest): Promise<UserOverview> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.userService.getUserOverview(userId);
  }
}