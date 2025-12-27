import { Routes } from '@angular/router';
import { adminGuard } from './auth/guards/admin.guard';
import { guestGuard } from './auth/guards/guest.guard';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'customer',
    canActivate: [authGuard],
    loadChildren: () => import('./customer/customer.routes').then((m) => m.customerRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./admin/layouts/admin-layout-page/admin-layout-page').then((m) => m.AdminLayoutPage),
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'sales',
    canActivate: [authGuard],
    loadChildren: () => import('./sales/sales.routes').then((m) => m.salesRoutes),
  },
  {
    path: 'errors',
    loadChildren: () => import('./errors/errors.routes').then((m) => m.errorRoutes),
  },
  {
    path: '',
    redirectTo: 'sales',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'errors/404',
  },
];
