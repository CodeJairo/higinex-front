import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { defer, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: 'PUBLISHED' | 'ARCHIVED' | string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  description?: string;
}

export interface CreateVariantPayload {
  sku: string;
  gtin?: string;
  name: string;
  attributesJson?: Record<string, string | number | boolean>;
  initialOnHand?: number;
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

  listProducts(
    limit: number = 100,
    offset: number = 0,
    status: string = 'ALL'
  ): Observable<Product[]> {
    const params = new HttpParams({
      fromObject: {
        limit: String(limit),
        offset: String(offset),
        status,
      },
    });

    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<Product[]>(this.buildUrl('/products'), { headers, params })
      )
    );
  }

  publishProduct(productId: string): Observable<Product> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.patch<Product>(this.buildUrl(`/products/publish/${productId}`), null, {
          headers,
        })
      )
    );
  }

  archiveProduct(productId: string): Observable<Product> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.patch<Product>(this.buildUrl(`/products/archive/${productId}`), null, {
          headers,
        })
      )
    );
  }

  createVariant(productId: string, payload: CreateVariantPayload): Observable<unknown> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.post(this.buildUrl(`/products/variants/create/${productId}`), payload, {
          headers,
        })
      )
    );
  }

  async createProduct(payload: CreateProductPayload): Promise<Product | null> {
    this.createProductErrorSignal.set(null);
    try {
      const result = await this.createProductMutation.mutateAsync(payload);
      return result as Product;
    } catch (error) {
      this.createProductErrorSignal.set(this.mapCreateProductError(error));
      return null;
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
