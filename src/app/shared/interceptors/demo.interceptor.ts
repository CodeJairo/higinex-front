import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { DemoService } from '../services/demo.service';

/**
 * HTTP Interceptor for demo mode.
 * Intercepts requests when demo mode is active and returns data from sessionStorage
 * or modifies URLs to use /demo/* endpoints.
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

  // Helper function to match exact API path segments
  const matchesPath = (pattern: RegExp): boolean => pattern.test(url);

  // Handle GET requests that should return data from sessionStorage
  if (req.method === 'GET') {
    // GET /orders or /orders?... - return demo orders (but not /orders/:id or other subpaths)
    if (matchesPath(/\/orders(\?|$)/) && !url.includes('/demo/')) {
      const orders = demoService.getDemoOrders();
      return of(new HttpResponse({ status: 200, body: orders }));
    }

    // GET /customers/me/addresses - return demo addresses
    if (matchesPath(/\/customers\/me\/addresses(\?|$)/)) {
      const addresses = demoService.getDemoAddresses();
      return of(new HttpResponse({ status: 200, body: addresses }));
    }

    // GET /inventory/balances - return demo inventory
    if (matchesPath(/\/inventory\/balances(\?|$)/)) {
      const inventory = demoService.getDemoInventory();
      return of(new HttpResponse({ status: 200, body: inventory }));
    }

    // GET /products - return demo products (but not /products/:id)
    if (matchesPath(/\/products(\?|$)/) && !url.includes('/demo/')) {
      const products = demoService.getDemoProducts();
      return of(new HttpResponse({ status: 200, body: products }));
    }

    // GET /contracts - return demo contracts
    if (matchesPath(/\/contracts(\?|$)/) && !url.includes('/demo/')) {
      const contracts = demoService.getDemoContracts();
      return of(new HttpResponse({ status: 200, body: contracts }));
    }
  }

  // Handle POST requests - redirect to demo endpoints
  if (req.method === 'POST') {
    // POST /orders - redirect to /demo/orders (but not already demo paths)
    if (matchesPath(/\/orders$/) && !url.includes('/demo/')) {
      const newUrl = url.replace(/\/orders$/, '/demo/orders');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // POST /customers/me/addresses - handle in demo mode
    if (matchesPath(/\/customers\/me\/addresses$/)) {
      const newUrl = url.replace(/\/customers\/me\/addresses$/, '/demo/addresses');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }
  }

  // Handle PATCH requests - redirect to demo endpoints for order status changes
  if (req.method === 'PATCH') {
    // PATCH /orders/:id/status - redirect to /demo/orders/:id/status
    if (matchesPath(/\/orders\/[^/]+\/status$/) && !url.includes('/demo/')) {
      const newUrl = url.replace(/\/orders\//, '/demo/orders/');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }

    // PATCH /customers/me/addresses/:id - handle in demo mode
    if (matchesPath(/\/customers\/me\/addresses\/[^/]+$/)) {
      const newUrl = url.replace(/\/customers\/me\/addresses\//, '/demo/addresses/');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }
  }

  // Handle DELETE requests
  if (req.method === 'DELETE') {
    // DELETE /customers/me/addresses/:id - handle in demo mode
    if (matchesPath(/\/customers\/me\/addresses\/[^/]+$/)) {
      const newUrl = url.replace(/\/customers\/me\/addresses\//, '/demo/addresses/');
      const clonedReq = req.clone({ url: newUrl });
      return next(clonedReq);
    }
  }

  // For all other requests, let them pass through
  return next(req);
};
