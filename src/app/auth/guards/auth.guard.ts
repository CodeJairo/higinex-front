import type { CanActivateFn } from '@angular/router';
import { ensureAccess } from './auth-access.util';

export const authGuard: CanActivateFn = async (route, state) => {
  return ensureAccess(undefined, state.url);
};
