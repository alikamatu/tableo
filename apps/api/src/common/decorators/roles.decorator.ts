import { SetMetadata } from '@nestjs/common';
import type { StaffRoleType } from '@tableo/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: StaffRoleType[]) => SetMetadata(ROLES_KEY, roles);
