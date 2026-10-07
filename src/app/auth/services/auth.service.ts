import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemoService, DemoUserType } from '../../shared/services/demo.service';
import {
  ChangePasswordPayload,
  LoginCredentials,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  Role,
  User,
} from '../interfaces';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

const AUTH_QUERY_KEY = ['auth', 'me'] as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly queryClient = inject(QueryClient);
  private readonly router = inject(Router);
  private readonly demoService = inject(DemoService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly loginErrorSignal = signal<string | null>(null);
  private readonly isRecoveryLoadingSignal = signal(false);
  private refreshInFlight: Promise<boolean> | null = null;
  private initialized = false;

  private readonly meQuery = injectQuery(() => ({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => this.fetchCurrentUser(),
    enabled: !!this.accessTokenSignal(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  }));

  private readonly loginMutation = injectMutation(() => ({
    mutationFn: (credentials: LoginCredentials) => this.loginRequest(credentials),
    onSuccess: (data) => {
      this.loginErrorSignal.set(null);
      this.setAccessToken(data.accessToken);
      this.queryClient.setQueryData(AUTH_QUERY_KEY, this.mapUser(data));
    },
  }));

  private readonly requestPasswordRecoveryMutation = injectMutation(() => ({
    mutationFn: (email: string) => this.requestPasswordRecoveryRequest(email),
  }));

  private readonly resetPasswordMutation = injectMutation(() => ({
    mutationFn: (payload: { email: string; code: string; newPassword: string }) =>
      this.resetPasswordRequest(payload),
  }));

  private readonly changePasswordMutation = injectMutation(() => ({
    mutationFn: (payload: ChangePasswordPayload) => this.changePasswordRequest(payload),
  }));

  private readonly refreshMutation = injectMutation(() => ({
    mutationFn: () => this.refreshRequest(),
    onSuccess: (data) => {
      this.setAccessToken(data.accessToken);
    },
    onError: () => {
      this.clearSession();
    },
  }));

  private readonly logoutMutation = injectMutation(() => ({
    mutationFn: () => this.logoutRequest(),
    onSettled: () => {
      this.clearSession();
      this.router.navigateByUrl('/auth/login');
    },
  }));

  readonly user = computed(() => {
    // In demo mode, create a mock user from demo data
    if (this.demoService.isDemoMode()) {
      const demoCustomer = this.demoService.getDemoCustomer();
      const demoType = this.demoService.demoType();
      return {
        id: 'demo-user-id',
        email: this.demoService.demoEmail() ?? 'demo@example.com',
        role: demoType === 'admin' ? Role.ADMIN : Role.USER,
        isActive: true,
        customer: demoCustomer,
      } as User;
    }
    return this.meQuery.data() ?? null;
  });
  readonly user$ = toObservable(this.user);
  readonly isDemoMode = this.demoService.isDemoMode;
  readonly isAuthenticated = computed(() => this.user() !== null || this.demoService.isDemoMode());
  readonly userName = computed(() => {
    const name = this.user()?.customer?.name;
    if (name) {
      return this.capitalizeWords(name);
    }
    return this.user()?.email ?? '';
  });
  readonly userEmail = computed(() => this.user()?.email ?? '');
  readonly loginError = this.loginErrorSignal.asReadonly();
  readonly isLoginLoading = computed(() => this.loginMutation.isPending());
  readonly isLoading = computed(
    () =>
      this.loginMutation.isPending() ||
      this.refreshMutation.isPending() ||
      this.logoutMutation.isPending() ||
      this.meQuery.isLoading() ||
      this.requestPasswordRecoveryMutation.isPending() ||
      this.resetPasswordMutation.isPending() ||
      this.changePasswordMutation.isPending(),
  );
  readonly isLoading$ = toObservable(this.isLoading);
  readonly sessionStatus = computed<SessionStatus>(() => {
    if (this.isLoading()) {
      return 'loading';
    }
    return this.isAuthenticated() ? 'authenticated' : 'unauthenticated';
  });
  readonly sessionStatus$ = toObservable(this.sessionStatus);

  initialize(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.refreshMutation.mutate();
  }

  async login(email: string, password: string): Promise<boolean> {
    this.loginErrorSignal.set(null);
    try {
      this.demoService.exitDemoMode();
      await this.loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      this.loginErrorSignal.set(this.mapLoginError(error));
      return false;
    }
  }

  async sendPasswordRecovery(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.requestPasswordRecoveryMutation.mutateAsync(email);
      return { success: true };
    } catch (error) {
      let message = 'No se pudo procesar la solicitud. Verifique el correo ingresado o intente nuevamente.';
      if (error instanceof HttpErrorResponse && error.error?.message) {
        message = Array.isArray(error.error.message)
          ? error.error.message.join(', ')
          : error.error.message;
      }
      return { success: false, message };
    }
  }

  async resetPassword(payload: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<boolean> {
    try {
      await this.resetPasswordMutation.mutateAsync(payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async changePassword(payload: ChangePasswordPayload): Promise<boolean> {
    try {
      await this.changePasswordMutation.mutateAsync(payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.get(this.buildUrl('/auth/email/verify'), {
          params: { token },
        }),
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    // Clear demo mode if active
    if (this.demoService.isDemoMode()) {
      this.demoService.exitDemoMode();
    }
    // Always clear session and redirect
    this.logoutMutation.mutate();
  }

  /**
   * Login as a demo user.
   * @param type 'admin' or 'user' demo type
   * @param email Email address for demo notifications
   * @returns Promise<boolean> indicating success
   */
  async loginAsDemo(type: DemoUserType, email: string): Promise<boolean> {
    this.loginErrorSignal.set(null);
    try {
      // Call the demo login endpoint
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(
          this.buildUrl('/demo/login'),
          { type, email },
          {
            withCredentials: true,
          },
        ),
      );

      this.setAccessToken(response.accessToken);

      // Initialize demo service with data
      const success = await this.demoService.initializeDemoMode(email, type);
      if (!success) {
        this.loginErrorSignal.set('No se pudo inicializar el modo demo. Intenta de nuevo.');
        return false;
      }

      return true;
    } catch (error) {
      this.loginErrorSignal.set(this.mapDemoLoginError(error));
      return false;
    }
  }

  private mapDemoLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        // Use the backend error message if available
        return error.error?.message || 'Datos inválidos. Verifica tu correo e intenta de nuevo.';
      }
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Intenta de nuevo.';
      }
    }
    return 'No se pudo iniciar el modo demo. Intenta de nuevo.';
  }

  clearLoginError(): void {
    this.loginErrorSignal.set(null);
  }

  requestWithAuthHeaders<T>(request: (headers: HttpHeaders) => Observable<T>): Promise<T> {
    return this.requestWithAuth(() => request(this.authHeaders()));
  }

  private async fetchCurrentUser(): Promise<User> {
    return this.requestWithAuth(() =>
      this.http.get<User>(this.buildUrl('/auth/me'), { headers: this.authHeaders() }),
    );
  }

  private async requestWithAuth<T>(request: () => Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(request());
    } catch (error) {
      if (this.isAuthError(error)) {
        const refreshed = await this.tryRefresh();
        if (refreshed) {
          return await firstValueFrom(request());
        }
      }
      throw error;
    }
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = this.refreshMutation
      .mutateAsync()
      .then((data) => {
        this.refreshInFlight = null;
        return !!data?.accessToken;
      })
      .catch(() => {
        this.refreshInFlight = null;
        return false;
      });

    return this.refreshInFlight;
  }

  private authHeaders(): HttpHeaders {
    const token = this.accessTokenSignal();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private setAccessToken(token: string | null): void {
    this.accessTokenSignal.set(token);
  }

  private clearSession(): void {
    this.setAccessToken(null);
    this.queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
  }

  private mapUser(data: User | LoginResponse): User {
    const { accessToken: _accessToken, ...user } = data as LoginResponse;
    return user;
  }

  private async loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(this.buildUrl('/auth/login'), credentials, {
        withCredentials: true,
      }),
    );
  }

  private async refreshRequest(): Promise<RefreshResponse> {
    return firstValueFrom(
      this.http.post<RefreshResponse>(this.buildUrl('/auth/refresh'), null, {
        withCredentials: true,
      }),
    );
  }

  private async logoutRequest(): Promise<LogoutResponse> {
    return firstValueFrom(
      this.http.post<LogoutResponse>(this.buildUrl('/auth/logout'), null, {
        withCredentials: true,
      }),
    );
  }

  private async requestPasswordRecoveryRequest(email: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(this.buildUrl('/auth/password/forgot'), { email }));
  }

  private async resetPasswordRequest(payload: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<void> {
    return firstValueFrom(this.http.post<void>(this.buildUrl('/auth/password/reset'), payload));
  }

  private async changePasswordRequest(payload: ChangePasswordPayload): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(this.buildUrl('/auth/password/change'), payload, {
        headers: this.authHeaders(),
      }),
    );
  }

  private isAuthError(error: unknown): boolean {
    return error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);
  }

  private mapLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const serverMessage = error.error?.message;
      if (typeof serverMessage === 'string') {
        if (serverMessage === 'User not found' || serverMessage.toLowerCase().includes('not found')) {
          return 'Este correo no está registrado como cliente corporativo en el sistema.';
        }
        if (serverMessage.includes('Invalid credentials') || serverMessage.toLowerCase().includes('password')) {
          return 'La contraseña ingresada es incorrecta. Verifique sus datos o use el enlace de recuperación.';
        }
        if (serverMessage.toLowerCase().includes('inactive')) {
          return 'Su cuenta corporativa se encuentra inactiva. Comuníquese con su gestor comercial.';
        }
        if (serverMessage.toLowerCase().includes('email not verified')) {
          return 'Su correo aún no ha sido verificado. Revise su bandeja de entrada corporativa.';
        }
      }
      if (error.status === 403) {
        return 'Su cuenta corporativa no tiene permisos de acceso o aún no ha sido activada.';
      }
      if (error.status === 401) {
        return 'Credenciales incorrectas. Verifique el correo corporativo y la contraseña ingresada.';
      }
      if (error.status === 404 || error.status === 400) {
        return 'Este correo no está registrado en el sistema. Solicítelo a través de su gestor comercial.';
      }
      if (error.status === 429) {
        return 'Demasiados intentos de acceso. Por seguridad institucional, espere unos minutos.';
      }
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor corporativo. Compruebe su conexión de red.';
      }
    }

    return 'No se pudo iniciar sesión. Verifique sus credenciales corporativas e intente nuevamente.';
  }

  private buildUrl(path: string): string {
    if (!this.apiBaseUrl) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }

  private capitalizeWords(value: string): string {
    return value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
      .join(' ');
  }
}
