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

      const orderId = `demo-order-${Date.now()}`;
      const orderNumber = `ORD-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

      const order: DemoOrder = {
        id: orderId,
        orderNumber,
        status: 'PAID',
        currency: 'COP',
        customerId: 'demo-customer-001',
        buyerFullName: 'Empresa Demo S.A.S',
        buyerEmail: this.demoService.demoEmail() ?? 'cliente-demo@higinex.com',
        buyerPhone: '+57 300 123 4567',
        buyerDocumentType: 'NIT',
        buyerDocumentNumber: '900123456-1',
        subtotalAmount: String(subtotalAmount),
        shippingAmount: '0',
        taxesAmount: String(Math.round(subtotalAmount * 0.19)),
        discountAmount: '0',
        totalAmount: String(Math.round(subtotalAmount * 1.19)),
        items: items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          orderId,
          variantId: it.variantId,
          productNameSnapshot: it.name,
          variantNameSnapshot: it.name,
          unitPriceAmount: String(it.unitPrice),
          quantity: it.quantity,
          lineTotalAmount: String(it.total),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save order to sessionStorage
      this.demoService.addDemoOrder(order);

      // Decrement inventory in demo mode
      for (const item of payload.items) {
        const currentInv = this.demoService.getDemoInventory().find((i) => i.variantId === item.variantId);
        if (currentInv) {
          this.demoService.updateDemoInventory(item.variantId, {
            onHand: Math.max(0, currentInv.onHand - item.quantity),
          });
        }
      }

      return order as unknown as CheckoutOrder;
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
