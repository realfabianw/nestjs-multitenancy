import { SetMetadata } from '@nestjs/common';
import { Permission } from '../entities/permissions.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequiresPermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
