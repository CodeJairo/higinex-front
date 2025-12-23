import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlSegment, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Role } from '../interfaces';
import { AuthService } from '../services/auth.service';

const LOGIN_URL = ['/auth/login'];
const FORBIDDEN_URL = ['/errors/404'];

const waitForSession = async (authService: AuthService): Promise<void> => {
  if (authService.sessionStatus() !== 'loading') {
    return;
  }

  await firstValueFrom(
    authService.sessionStatus$.pipe(
      filter((status) => status !== 'loading'),
      take(1)
    )
  );
};

const buildReturnUrl = (segments: UrlSegment[]): string => {
  const path = segments.map((segment) => segment.path).filter(Boolean).join('/');
  return `/${path}`;
};

const checkAccess = async (
  roles: Role[] | undefined,
  returnUrl?: string
): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await waitForSession(authService);

  if (!authService.isAuthenticated()) {
    const extras = returnUrl ? { queryParams: { returnUrl } } : undefined;
    return router.createUrlTree(LOGIN_URL, extras);
  }

  if (!roles || roles.length === 0) {
    return true;
  }

  const user = authService.user();
  if (!user || !roles.includes(user.role)) {
    return router.createUrlTree(FORBIDDEN_URL);
  }

  return true;
};

export const roleMatchGuard: CanMatchFn = (route, segments) =>
  checkAccess(route.data?.['roles'] as Role[] | undefined, buildReturnUrl(segments));

export const roleGuard: CanActivateFn = (route, state) =>
  checkAccess(route.data?.['roles'] as Role[] | undefined, state.url);
