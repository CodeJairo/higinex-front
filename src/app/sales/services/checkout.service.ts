import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { DemoOrder, DemoService } from '../../shared/services/demo.service';
import { CheckoutAddress, CheckoutOrder, CreateOrderPayload } from '../interfaces';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

interface CreateDemoOrderPayload extends CreateOrderPayload {
  demoEmail?: string;
  sendInvoice?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly demoService = inject(DemoService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

  listAddresses(
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET
  ): Promise<CheckoutAddress[]> {
    // In demo mode, return addresses from sessionStorage
    if (this.demoService.isDemoMode()) {
      const addresses = this.demoService.getDemoAddresses();
      return Promise.resolve(addresses as CheckoutAddress[]);
    }

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

  async createOrder(payload: CreateOrderPayload): Promise<CheckoutOrder> {
    // In demo mode, use the demo endpoint
    if (this.demoService.isDemoMode()) {
      const demoPayload: CreateDemoOrderPayload = {
        ...payload,
        demoEmail: this.demoService.demoEmail() ?? undefined,
        sendInvoice: true,
      };

      const order = await firstValueFrom(
        this.http.post<CheckoutOrder>(this.buildUrl('/demo/orders'), demoPayload)
      );

      // Save order to sessionStorage
      this.demoService.addDemoOrder(order as unknown as DemoOrder);

      return order;
    }

    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.post<CheckoutOrder>(this.buildUrl('/orders'), payload, { headers })
    );
  }

  async getOrder(orderId: string): Promise<CheckoutOrder> {
    // In demo mode, first try to get from sessionStorage
    if (this.demoService.isDemoMode()) {
      const orders = this.demoService.getDemoOrders();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        return order as unknown as CheckoutOrder;
      }
    }

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
