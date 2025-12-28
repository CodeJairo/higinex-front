import { Routes } from '@angular/router';
import { SalesLayoutPage } from './Layouts/sales-layout-page/sales-layout-page';
import { CartPage } from './pages/cart-page/cart-page';
import { CatalogPage } from './pages/catalog-page/catalog-page';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { OrderConfirmationPage } from './pages/order-confirmation-page/order-confirmation-page';
import { CheckoutLayoutPage } from './Layouts/checkout-layout-page/checkout-layout-page';

export const salesRoutes: Routes = [
  {
    path: 'catalog',
    component: SalesLayoutPage,
    children: [
      {
        path: '',
        component: CatalogPage,
      },
    ],
  },
  {
    path: 'checkout',
    component: CheckoutLayoutPage,
    children: [
      {
        path: 'cart',
        component: CartPage,
      },
      {
        path: 'confirm',
        component: CheckoutPage,
      },

      {
        path: 'order/:orderId',
        component: OrderConfirmationPage,
      },
    ],
  },

  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('../errors/pages/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
