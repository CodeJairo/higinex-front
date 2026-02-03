import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { defer, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { DemoService } from '../../shared/services/demo.service';
import { InventoryAdjustmentPayload, InventoryBalance, InventoryMovement, InventorySummary } from '../interfaces/inventory.interface';
import { CreateProductPayload, CreateVariantPayload, Product } from '../interfaces/products.interface';

@Injectable({ providedIn: 'root' })
export class InventoryManagementService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly demoService = inject(DemoService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');
  private readonly queryClient = inject(QueryClient);
  private readonly createProductErrorSignal = signal<string | null>(null);

  private readonly createProductMutation = injectMutation(() => ({
    mutationFn: (payload: CreateProductPayload) => this.createProductRequest(payload),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  }));

  readonly createProductError = this.createProductErrorSignal.asReadonly();
  readonly isCreatingProduct = computed(() => this.createProductMutation.isPending());

  // --- Inventory Summary & Balances ---

  getInventorySummary(): Observable<InventorySummary> {
    // In demo mode, calculate summary from demo data
    if (this.demoService.isDemoMode()) {
      const inventory = this.demoService.getDemoInventory();
      const totalOnHand = inventory.reduce((sum, i) => sum + i.onHand, 0);
      const totalReserved = inventory.reduce((sum, i) => sum + i.reserved, 0);
      const summary: InventorySummary = {
        totalOnHand,
        totalReserved,
        totalAvailable: totalOnHand - totalReserved,
      };
      return of(summary);
    }

    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<InventorySummary>(this.buildUrl('/inventory/summary'), { headers })
      )
    );
  }

  getInventoryBalances(
    limit: number = 20,
    offset: number = 0,
    q: string = ''
  ): Observable<InventoryBalance[]> {
    // In demo mode, return inventory from sessionStorage
    if (this.demoService.isDemoMode()) {
      const inventory = this.demoService.getDemoInventory() as unknown as InventoryBalance[];
      return of(inventory.slice(offset, offset + limit));
    }

    const params = new HttpParams({
      fromObject: {
        limit: String(limit),
        offset: String(offset),
        ...(q ? { q } : {}),
      },
    });

    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<InventoryBalance[]>(this.buildUrl('/inventory/balances'), {
          headers,
          params,
        })
      )
    );
  }

  adjustInventory(payload: InventoryAdjustmentPayload): Observable<unknown> {
    // In demo mode, adjust inventory locally
    if (this.demoService.isDemoMode()) {
      this.demoService.updateDemoInventory(payload.variantId, {
        onHand: payload.quantity,
      });
      return of({ success: true });
    }

    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.post(this.buildUrl('/inventory/adjust'), payload, { headers })
      )
    );
  }

  // --- Inventory Movements ---

  getInventoryMovements(
    limit: number = 20,
    offset: number = 0,
    filters: {
      variantId?: string;
      orderId?: string;
      type?: 'IN' | 'OUT' | 'SOLD' | 'RESERVED' | 'UNRESERVED' | 'ADJUSTMENT';
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Observable<InventoryMovement[]> {
    let params = new HttpParams({
      fromObject: {
        limit: String(limit),
        offset: String(offset),
      },
    });

    if (filters.variantId) params = params.set('variantId', filters.variantId);
    if (filters.orderId) params = params.set('orderId', filters.orderId);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);

    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<InventoryMovement[]>(this.buildUrl('/inventory/movements'), {
          headers,
          params,
        })
      )
    );
  }

  listProducts(
    limit: number = 100,
    offset: number = 0,
    status: string = 'ALL'
  ): Observable<Product[]> {
    // In demo mode, return products from sessionStorage
    if (this.demoService.isDemoMode()) {
      const products = this.demoService.getDemoProducts() as unknown as Product[];
      return of(products.slice(offset, offset + limit));
    }

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
