import { SetMetadata } from '@nestjs/common';

export const REQUIRES_PERMISSION = 'requires_permission';

export const RequiresPermission = (permission: string) => SetMetadata(REQUIRES_PERMISSION, permission);
