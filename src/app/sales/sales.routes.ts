import { Routes } from '@angular/router';
import { NotFoundPage } from '../errors/pages/not-found-page/not-found-page';
import { SalesLayoutPage } from './Layouts/sales-layout-page/sales-layout-page';
import { CartPage } from './pages/cart-page/cart-page';
import { CatalogPage } from './pages/catalog-page/catalog-page';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { OrderConfirmationPage } from './pages/order-confirmation-page/order-confirmation-page';

export const salesRoutes: Routes = [
  {
    path: '',
    component: SalesLayoutPage,
    children: [
      {
        path: 'catalog',
        component: CatalogPage,
      },
      {
        path: '',
        redirectTo: 'catalog',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'cart',
    component: CartPage,
  },
  {
    path: 'checkout',
    component: CheckoutPage,
  },
  {
    path: 'order-confirmation',
    component: OrderConfirmationPage,
  },
  {
    path: '**',
    loadComponent: () =>
      import('../errors/pages/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
