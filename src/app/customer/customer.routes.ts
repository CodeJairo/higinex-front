import { Routes } from '@angular/router';
import { CustomerLayoutPage } from './layouts/customer-layout-page/customer-layout-page';
import { AddressesPage } from './pages/addresses-page/addresses-page';
import { AppearancePage } from './pages/appearance-page/appearance-page';
import { ProfilePage } from './pages/profile-page/profile-page';

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
      {
        path: 'profile',
        component: ProfilePage,
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('../errors/pages/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
