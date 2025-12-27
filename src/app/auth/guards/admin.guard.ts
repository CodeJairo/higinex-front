import type { CanActivateFn } from '@angular/router';
import { ensureAccess } from './auth-access.util';
import { Role } from '../interfaces';

export const adminGuard: CanActivateFn = async (route, state) => {
  return ensureAccess([Role.ADMIN], state.url);
};
