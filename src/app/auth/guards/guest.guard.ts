import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

const REDIRECT_URL = ['/sales'];

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

const redirectIfAuthenticated = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await waitForSession(authService);

  if (authService.isAuthenticated()) {
    return router.createUrlTree(REDIRECT_URL);
  }

  return true;
};

export const guestMatchGuard: CanMatchFn = () => redirectIfAuthenticated();
export const guestGuard: CanActivateFn = () => redirectIfAuthenticated();
