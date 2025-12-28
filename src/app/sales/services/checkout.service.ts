import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { CheckoutAddress, CheckoutOrder, CreateOrderPayload } from '../interfaces';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

  listAddresses(
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET
  ): Promise<CheckoutAddress[]> {
    const params = new HttpParams({
      fromObject: {
        limit: String(limit),
        offset: String(offset),
      },
    });

    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.get<CheckoutAddress[]>(this.buildUrl('/customers/me/addresses'), {
        headers,
        params,
      })
    );
  }

  createOrder(payload: CreateOrderPayload): Promise<CheckoutOrder> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.post<CheckoutOrder>(this.buildUrl('/orders'), payload, { headers })
    );
  }

  getOrder(orderId: string): Promise<CheckoutOrder> {
    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.get<CheckoutOrder>(this.buildUrl(`/orders/${orderId}`), { headers })
    );
  }

  private buildUrl(path: string): string {
    if (!this.apiBaseUrl) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }
}
