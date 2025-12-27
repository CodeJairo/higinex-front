import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Role } from '../interfaces';

const LOGIN_URL = ['/auth/login'];
const FORBIDDEN_URL = ['/errors/404'];

export const waitForSession = async (auth: AuthService) => {
  if (auth.sessionStatus() !== 'loading') return;

  await firstValueFrom(
    auth.sessionStatus$.pipe(
      filter((status) => status !== 'loading'),
      take(1)
    )
  );
};

export const ensureAccess = async (
  roles?: Role[],
  returnUrl?: string
): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await waitForSession(auth);

  // Usuario no autenticado → enviar a login
  if (!auth.isAuthenticated()) {
    const extras = returnUrl ? { queryParams: { returnUrl } } : undefined;
    return router.createUrlTree(LOGIN_URL, extras);
  }

  // Si no se requieren roles → acceso permitido
  if (!roles?.length) return true;

  const user = auth.user();
  if (!user || !roles.includes(user.role)) {
    return router.createUrlTree(FORBIDDEN_URL);
  }

  return true;
};
