import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { DemoService } from '../services/demo.service';

/**
 * HTTP Interceptor for demo mode.
 * Intercepts requests when demo mode is active and returns data from sessionStorage
 * or redirects to /demo/* endpoints as per backend documentation.
 * 
 * Backend Demo Endpoints:
 * - GET /demo/products - List demo products
 * - GET /demo/orders - Returns [] (frontend manages orders in sessionStorage)
 * - GET /demo/addresses - List demo addresses
 * - GET /demo/inventory - List demo inventory
 * - POST /demo/orders - Create demo order (sends invoice email)
 * - POST /demo/orders/:id/status - Update order status (sends notification email)
 * - POST /demo/addresses - Create demo address
 * - PATCH /demo/addresses/:id - Update demo address
 * - DELETE /demo/addresses/:id - Delete demo address
 * - POST /demo/inventory/adjust - Adjust demo inventory
 */
export const demoInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const demoService = inject(DemoService);

  // Only intercept if demo mode is active
  if (!demoService.isDemoMode()) {
    return next(req);
  }

  const url = req.url;

  // Skip if already a demo endpoint
  if (url.includes('/demo/')) {
    return next(req);
  }

  // Helper function to match exact API path segments
  const matchesPath = (pattern: RegExp): boolean => pattern.test(url);

  // Handle GET requests - return cached data from sessionStorage
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
      const order = orders.find(o => o.id === orderId);
      if (order) {
        return of(new HttpResponse({ status: 200, body: order }));
      }
    }

    // GET /customers/me/addresses - return demo addresses from sessionStorage
    if (matchesPath(/\/customers\/me\/addresses(\?|$)/)) {
      const addresses = demoService.getDemoAddresses();
      return of(new HttpResponse({ status: 200, body: addresses }));
    }

    // GET /inventory/balances - return demo inventory from sessionStorage
    if (matchesPath(/\/inventory\/balances(\?|$)/)) {
      const inventory = demoService.getDemoInventory();
      return of(new HttpResponse({ status: 200, body: inventory }));
    }

    // GET /inventory/summary - return demo inventory summary
    if (matchesPath(/\/inventory\/summary(\?|$)/)) {
      const inventory = demoService.getDemoInventory();
      const totalOnHand = inventory.reduce((sum, i) => sum + i.onHand, 0);
      const totalReserved = inventory.reduce((sum, i) => sum + i.reserved, 0);
      return of(new HttpResponse({ 
        status: 200, 
        body: {
          totalOnHand,
          totalReserved,
          totalAvailable: totalOnHand - totalReserved,
        }
      }));
    }

    // GET /products or /products?... - redirect to /demo/products
    if (matchesPath(/\/products(\?|$)/)) {
      const newUrl = url.replace(/\/products/, '/demo/products');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // GET /products/variants - redirect to /demo/products (backend returns variants with products)
    if (matchesPath(/\/products\/variants(\?|$)/)) {
      const newUrl = url.replace(/\/products\/variants/, '/demo/products');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // GET /contracts - return demo contracts from sessionStorage
    if (matchesPath(/\/contracts(\?|$)/)) {
      const contracts = demoService.getDemoContracts();
      return of(new HttpResponse({ status: 200, body: contracts }));
    }
  }

  // Handle POST requests - redirect to demo endpoints
  if (req.method === 'POST') {
    // POST /orders - redirect to /demo/orders
    if (matchesPath(/\/orders$/)) {
      const newUrl = url.replace(/\/orders$/, '/demo/orders');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // POST /orders/:id/status - redirect to /demo/orders/:id/status
    if (matchesPath(/\/orders\/[^/]+\/status$/)) {
      const newUrl = url.replace(/\/orders\//, '/demo/orders/');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // POST /customers/me/addresses - redirect to /demo/addresses
    if (matchesPath(/\/customers\/me\/addresses$/)) {
      const newUrl = url.replace(/\/customers\/me\/addresses$/, '/demo/addresses');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // POST /inventory/adjust - redirect to /demo/inventory/adjust
    if (matchesPath(/\/inventory\/adjust$/)) {
      const newUrl = url.replace(/\/inventory\/adjust$/, '/demo/inventory/adjust');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // POST /products - redirect to /demo/products (admin only)
    if (matchesPath(/\/products$/)) {
      const newUrl = url.replace(/\/products$/, '/demo/products');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }
  }

  // Handle PATCH requests - redirect to demo endpoints
  if (req.method === 'PATCH') {
    // PATCH /orders/:id/status - redirect to /demo/orders/:id/status
    if (matchesPath(/\/orders\/[^/]+\/status$/)) {
      const newUrl = url.replace(/\/orders\//, '/demo/orders/');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // PATCH /customers/me/addresses/:id - redirect to /demo/addresses/:id
    if (matchesPath(/\/customers\/me\/addresses\/[^/]+$/)) {
      const newUrl = url.replace(/\/customers\/me\/addresses\//, '/demo/addresses/');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }
  }

  // Handle DELETE requests
  if (req.method === 'DELETE') {
    // DELETE /customers/me/addresses/:id - redirect to /demo/addresses/:id
    if (matchesPath(/\/customers\/me\/addresses\/[^/]+$/)) {
      const newUrl = url.replace(/\/customers\/me\/addresses\//, '/demo/addresses/');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }
  }

  // For all other requests, let them pass through
  return next(req);
};
