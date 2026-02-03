import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { DemoService } from '../../shared/services/demo.service';
import { Product, ProductVariant, VariantImage } from '../interfaces';

const DEFAULT_LIMIT = 100;
const DEFAULT_OFFSET = 0;

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly demoService = inject(DemoService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

  listProducts(limit: number = DEFAULT_LIMIT, offset: number = DEFAULT_OFFSET): Promise<Product[]> {
    const params = new HttpParams({
      fromObject: {
        status: 'published',
        limit: String(limit),
        offset: String(offset),
      },
    });

    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.get<Product[]>(this.buildUrl('/products'), { headers, params })
    );
  }

  listVariants(
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET
  ): Promise<ProductVariant[]> {
    const params = new HttpParams({
      fromObject: {
        status: 'active',
        productStatus: 'published',
        limit: String(limit),
        offset: String(offset),
      },
    });

    // In demo mode, the interceptor will redirect to /demo/products
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.get<ProductVariant[]>(this.buildUrl('/products/variants'), { headers, params })
    );
  }

  listVariantImages(variantId: string): Promise<VariantImage[]> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.get<VariantImage[]>(this.buildUrl(`/products/variants/${variantId}/images`), {
        headers,
      })
    );
  }

  buildVariantImageUrl(variantId: string, imageId: string): string {
    return this.buildUrl(`/products/variants/${variantId}/images/${imageId}`);
  }

  private buildUrl(path: string): string {
    if (!this.apiBaseUrl) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }
}
