import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

const REDIRECT_URL = ['/sales'];

export const guestGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar si el estado aún está cargando
  if (authService.sessionStatus() === 'loading') {
    await firstValueFrom(
      authService.sessionStatus$.pipe(
        filter((status) => status !== 'loading'),
        take(1)
      )
    );
  }

  // Si YA está logueado → redirigir a landing
  if (authService.isAuthenticated()) {
    return router.createUrlTree(REDIRECT_URL);
  }

  // Si NO está logueado → permitir acceso a login / recovery
  return true;
};
