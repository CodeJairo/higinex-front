import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom, Observable } from 'rxjs';
import { LoginCredentials, LoginResponse, LogoutResponse, RefreshResponse, User } from '../interfaces';
import { environment } from '../../../environments/environment';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

const AUTH_QUERY_KEY = ['auth', 'me'] as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly queryClient = inject(QueryClient);
  private readonly router = inject(Router);
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

  readonly user = computed(() => this.meQuery.data() ?? null);
  readonly user$ = toObservable(this.user);
  readonly isAuthenticated = computed(() => this.user() !== null);
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
      this.isRecoveryLoadingSignal()
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
      await this.loginMutation.mutateAsync({ email, password });
      return true;
    } catch (error) {
      this.loginErrorSignal.set(this.mapLoginError(error));
      return false;
    }
  }

  async sendPasswordRecovery(email: string): Promise<boolean> {
    this.isRecoveryLoadingSignal.set(true);

    try {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 2000);
      });
      return true;
    } finally {
      this.isRecoveryLoadingSignal.set(false);
    }
  }

  logout(): void {
    this.logoutMutation.mutate();
  }

  clearLoginError(): void {
    this.loginErrorSignal.set(null);
  }

  private async fetchCurrentUser(): Promise<User> {
    return this.requestWithAuth(() =>
      this.http.get<User>(this.buildUrl('/auth/me'), { headers: this.authHeaders() })
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
      })
    );
  }

  private async refreshRequest(): Promise<RefreshResponse> {
    return firstValueFrom(
      this.http.post<RefreshResponse>(this.buildUrl('/auth/refresh'), null, {
        withCredentials: true,
      })
    );
  }

  private async logoutRequest(): Promise<LogoutResponse> {
    return firstValueFrom(
      this.http.post<LogoutResponse>(this.buildUrl('/auth/logout'), null, {
        withCredentials: true,
      })
    );
  }

  private isAuthError(error: unknown): boolean {
    return error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);
  }

  private mapLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'Tu correo no esta verificado. Revisa tu bandeja y vuelve a intentar.';
      }
      if (error.status === 401) {
        return 'Credenciales invalidas. Verifica tu correo y contrasena.';
      }
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Intenta de nuevo.';
      }
    }

    return 'No se pudo iniciar sesion. Intenta de nuevo.';
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
