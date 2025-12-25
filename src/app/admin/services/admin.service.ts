import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { environment } from '../../../environments/environment';
import { RegisterPayload, User } from '../../auth/interfaces';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');
  private readonly registerErrorSignal = signal<string | null>(null);

  private readonly registerMutation = injectMutation(() => ({
    mutationFn: (payload: RegisterPayload) => this.registerRequest(payload),
  }));

  readonly registerError = this.registerErrorSignal.asReadonly();
  readonly isRegisterLoading = computed(() => this.registerMutation.isPending());

  async register(payload: RegisterPayload): Promise<boolean> {
    this.registerErrorSignal.set(null);
    try {
      await this.registerMutation.mutateAsync(payload);
      return true;
    } catch (error) {
      this.registerErrorSignal.set(this.mapRegisterError(error));
      return false;
    }
  }

  clearRegisterError(): void {
    this.registerErrorSignal.set(null);
  }

  private async registerRequest(payload: RegisterPayload): Promise<User> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.post<User>(this.buildUrl('/auth/register'), payload, { headers })
    );
  }

  private mapRegisterError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Datos invalidos. Revisa el formulario e intenta de nuevo.';
      }
      if (error.status === 403) {
        return 'No tienes permisos para registrar usuarios.';
      }
      if (error.status === 409) {
        return 'El correo o el documento ya estan registrados.';
      }
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Intenta de nuevo.';
      }
    }

    return 'No se pudo registrar el usuario. Intenta de nuevo.';
  }

  private buildUrl(path: string): string {
    if (!this.apiBaseUrl) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }
}
