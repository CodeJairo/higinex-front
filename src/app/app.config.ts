import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { withDevtools } from '@tanstack/angular-query-experimental/devtools';
import { routes } from './app.routes';
import { AuthService } from './auth/services/auth.service';
import { AppearanceService } from './customer/services/appearance.service';
import { demoInterceptor } from './shared/interceptors/demo.interceptor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([demoInterceptor])),
    provideTanStackQuery(queryClient, ...(isDevMode() ? [withDevtools()] : [])),
    provideAppInitializer(() => {
      inject(AuthService).initialize();
      inject(AppearanceService); // Ensure service starts to apply theme
    }),
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};
