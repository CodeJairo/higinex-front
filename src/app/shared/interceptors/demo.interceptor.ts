import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { DemoOrder, DemoService } from '../services/demo.service';

export const demoInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const demoService = inject(DemoService);

  // Only intercept if demo mode is active
  if (!demoService.isDemoMode()) {
    return next(req);
  }

  const url = req.url;

  // Skip if already a demo backend endpoint (like /demo/login or /demo/initial-data)
  if (url.includes('/demo/login') || url.includes('/demo/initial-data') || url.includes('/demo/send-invoice') || url.includes('/demo/notify-status')) {
    return next(req);
  }

  // Helper function to match exact API path segments
  const matchesPath = (pattern: RegExp): boolean => pattern.test(url);

  // Handle GET requests - return cached/mocked data from DemoService
  if (req.method === 'GET') {
    // GET /orders - return demo orders from sessionStorage
    if (matchesPath(/\/orders(\?|$)/)) {
      const orders = demoService.getDemoOrders();
      return of(new HttpResponse({ status: 200, body: orders }));
    }

    // GET /orders/:id - return specific order from sessionStorage
    if (matchesPath(/\/orders\/[^/]+$/)) {
      const orderId = url.match(/\/orders\/([^/?]+)/)?.[1];
      const orders = demoService.getDemoOrders();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        return of(new HttpResponse({ status: 200, body: order }));
      }
    }

    // GET /customers/me/addresses - return demo addresses from sessionStorage
    if (matchesPath(/\/customers\/me\/addresses(\?|$)/)) {
      const addresses = demoService.getDemoAddresses();
      return of(new HttpResponse({ status: 200, body: addresses }));
    }

    // GET /inventory/balances - return hydrated demo inventory
    if (matchesPath(/\/inventory\/balances(\?|$)/)) {
      const balances = demoService.getDemoInventoryBalances();
      return of(new HttpResponse({ status: 200, body: balances }));
    }

    // GET /inventory/summary - return demo inventory summary
    if (matchesPath(/\/inventory\/summary(\?|$)/)) {
      const inventory = demoService.getDemoInventory();
      const totalOnHand = inventory.reduce((sum, i) => sum + i.onHand, 0);
      const totalReserved = inventory.reduce((sum, i) => sum + i.reserved, 0);
      return of(
        new HttpResponse({
          status: 200,
          body: {
            totalOnHand,
            totalReserved,
            totalAvailable: totalOnHand - totalReserved,
          },
        }),
      );
    }

    // GET /products/variants - return demo variants with pricing & inventory
    if (matchesPath(/\/products\/variants(\?|$)/)) {
      const variants = demoService.getDemoProductVariants();
      return of(new HttpResponse({ status: 200, body: variants }));
    }

    // GET /products or /products?... - return demo product list
    if (matchesPath(/\/products(\?|$)/)) {
      const products = demoService.getDemoProductList();
      return of(new HttpResponse({ status: 200, body: products }));
    }

    // GET /contracts - return demo contracts from sessionStorage
    if (matchesPath(/\/contracts(\?|$)/)) {
      const contracts = demoService.getDemoContracts();
      return of(new HttpResponse({ status: 200, body: contracts }));
    }
  }

  // Handle POST requests in demo mode (simulate success locally)
  if (req.method === 'POST') {
    // POST /orders or /demo/orders - create demo order locally
    if (matchesPath(/\/orders$/)) {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const newOrder: DemoOrder = {
        id: `demo-order-${Date.now()}`,
        orderNumber: `ORD-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'PAID',
        currency: 'COP',
        customerId: 'demo-customer-001',
        buyerFullName: 'Empresa Demo S.A.S',
        buyerEmail: demoService.demoEmail() ?? 'cliente-demo@higinex.com',
        buyerPhone: '+57 300 123 4567',
        buyerDocumentType: 'NIT',
        buyerDocumentNumber: '900123456-1',
        subtotalAmount: String(body['subtotalAmount'] ?? '0'),
        shippingAmount: '0',
        taxesAmount: String(Math.round(Number(body['subtotalAmount'] ?? 0) * 0.19)),
        discountAmount: '0',
        totalAmount: String(body['totalAmount'] ?? body['subtotalAmount'] ?? '0'),
        items: (body['items'] as any) ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoService.addDemoOrder(newOrder);
      return of(new HttpResponse({ status: 201, body: newOrder }));
    }

    // POST /inventory/adjust
    if (matchesPath(/\/inventory\/adjust$/)) {
      const body = req.body as { variantId: string; quantity: number };
      if (body?.variantId) {
        demoService.updateDemoInventory(body.variantId, { onHand: body.quantity });
      }
      return of(new HttpResponse({ status: 200, body: { success: true } }));
    }

    // POST /customers/me/addresses
    if (matchesPath(/\/customers\/me\/addresses$/)) {
      const body = (req.body ?? {}) as any;
      const newAddr = {
        id: `demo-addr-${Date.now()}`,
        ...body,
        isDefault: body.isDefault ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoService.addDemoAddress(newAddr);
      return of(new HttpResponse({ status: 201, body: newAddr }));
    }
  }

  // Handle PATCH requests in demo mode
  if (req.method === 'PATCH') {
    // PATCH /orders/:id/status
    if (matchesPath(/\/orders\/[^/]+\/status$/)) {
      const orderId = url.match(/\/orders\/([^/]+)\/status/)?.[1];
      const body = req.body as { status: string };
      if (orderId && body?.status) {
        demoService.updateDemoOrderStatus(orderId, body.status);
        const order = demoService.getDemoOrders().find((o) => o.id === orderId);
        return of(new HttpResponse({ status: 200, body: order }));
      }
    }

    // PATCH /customers/me/addresses/:id
    if (matchesPath(/\/customers\/me\/addresses\/[^/]+$/)) {
      const addressId = url.match(/\/customers\/me\/addresses\/([^/?]+)/)?.[1];
      const body = (req.body ?? {}) as any;
      if (addressId) {
        demoService.updateDemoAddress(addressId, body);
        return of(new HttpResponse({ status: 200, body: { success: true } }));
      }
    }
  }

  // Handle DELETE requests in demo mode
  if (req.method === 'DELETE') {
    // DELETE /customers/me/addresses/:id
    if (matchesPath(/\/customers\/me\/addresses\/[^/]+$/)) {
      const addressId = url.match(/\/customers\/me\/addresses\/([^/?]+)/)?.[1];
      if (addressId) {
        demoService.deleteDemoAddress(addressId);
        return of(new HttpResponse({ status: 200, body: { success: true } }));
      }
    }
  }

  // For all other requests, pass through
  return next(req);
};
