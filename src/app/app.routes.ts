import { Routes } from '@angular/router';
import { roleMatchGuard } from './auth/guards/role.guard';
import { Role } from './auth/interfaces';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'sales',
    canMatch: [roleMatchGuard],
    data: {
      roles: [Role.ADMIN, Role.USER],
    },
    loadComponent: () =>
      import('./sales/Layouts/sales-layout-page/sales-layout-page').then((m) => m.SalesLayoutPage),
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
