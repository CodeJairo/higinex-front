import { Routes } from '@angular/router';
import { AddressesPage } from './pages/addresses-page/addresses-page';
import { CustomerLayoutPage } from './layouts/customer-layout-page/customer-layout-page';
import { AppearancePage } from './pages/appearance-page/appearance-page';

export const customerRoutes: Routes = [
  {
    path: '',
    canActivate: [],
    component: CustomerLayoutPage,
    children: [
      {
        path: 'addresses',
        component: AddressesPage,
      },
      {
        path: 'appearance',
        component: AppearancePage,
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('../errors/pages/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
