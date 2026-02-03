import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { DemoOrder, DemoService } from '../../shared/services/demo.service';
import { CheckoutAddress, CheckoutOrder, CreateOrderPayload } from '../interfaces';
import { CatalogService } from './catalog.service';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

interface CreateDemoOrderPayload extends CreateOrderPayload {
  demoEmail?: string;
  sendInvoice?: boolean;
  subtotalAmount?: number;
  totalAmount?: number;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly demoService = inject(DemoService);
  private readonly catalogService = inject(CatalogService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

  listAddresses(
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
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
      }),
    );
  }

  async createOrder(payload: CreateOrderPayload): Promise<CheckoutOrder> {
    // In demo mode, use the demo endpoint
    if (this.demoService.isDemoMode()) {
      // Fetch variants to get prices and names
      const variants = await this.catalogService.listVariants(100, 0);

      // Calculate totals and build items payload
      let subtotalAmount = 0;
      const items = payload.items.map((item) => {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new Error(`Variant not found: ${item.variantId}`);
        }
        const unitPrice = variant.unitPriceCop ?? 0;
        const total = unitPrice * item.quantity;
        subtotalAmount += total;

        return {
          variantId: item.variantId,
          name: variant.name,
          quantity: item.quantity,
          unitPrice,
          total,
        };
      });

      const demoPayload: CreateDemoOrderPayload = {
        ...payload,
        items,
        subtotalAmount,
        totalAmount: subtotalAmount, // Simplified: assuming no extra fees for demo
        demoEmail: this.demoService.demoEmail() ?? undefined,
        sendInvoice: true,
      };

      const order = await this.authService.requestWithAuthHeaders((headers) =>
        this.http.post<CheckoutOrder>(this.buildUrl('/demo/orders'), demoPayload, { headers }),
      );

      // Save order to sessionStorage
      this.demoService.addDemoOrder(order as unknown as DemoOrder);

      return order;
    }

    return this.authService.requestWithAuthHeaders((headers) =>
      this.http.post<CheckoutOrder>(this.buildUrl('/orders'), payload, { headers }),
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
      this.http.get<CheckoutOrder>(this.buildUrl(`/orders/${orderId}`), { headers }),
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
