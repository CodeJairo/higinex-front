import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

export interface CreateProductPayload {
  name: string;
  slug: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryManagementService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');
  private readonly createProductErrorSignal = signal<string | null>(null);

  private readonly createProductMutation = injectMutation(() => ({
    mutationFn: (payload: CreateProductPayload) => this.createProductRequest(payload),
  }));

  readonly createProductError = this.createProductErrorSignal.asReadonly();
  readonly isCreatingProduct = computed(() => this.createProductMutation.isPending());

  async createProduct(payload: CreateProductPayload): Promise<boolean> {
    this.createProductErrorSignal.set(null);
    try {
      await this.createProductMutation.mutateAsync(payload);
      return true;
    } catch (error) {
      this.createProductErrorSignal.set(this.mapCreateProductError(error));
      return false;
    }
  }

  clearCreateProductError(): void {
    this.createProductErrorSignal.set(null);
  }

  private async createProductRequest(payload: CreateProductPayload): Promise<unknown> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.post(this.buildUrl('/products'), payload, { headers })
    );
  }

  private mapCreateProductError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Datos invalidos. Revisa el formulario e intenta de nuevo.';
      }
      if (error.status === 403) {
        return 'No tienes permisos para crear productos.';
      }
      if (error.status === 409) {
        return 'Ya existe un producto con ese slug.';
      }
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Intenta de nuevo.';
      }
    }

    return 'No se pudo crear el producto. Intenta de nuevo.';
  }

  private buildUrl(path: string): string {
    if (!this.apiBaseUrl) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }
}
