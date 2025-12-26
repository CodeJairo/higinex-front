import { Routes } from '@angular/router';
import { roleMatchGuard } from './auth/guards/role.guard';
import { SalesLayoutPage } from './sales/Layouts/sales-layout-page/sales-layout-page';
import { salesRoutes } from './sales/sales.routes';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/layouts/admin-layout-page/admin-layout-page').then((m) => m.AdminLayoutPage),
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'sales',
    canMatch: [roleMatchGuard],
    component: SalesLayoutPage,
    children: salesRoutes,
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
