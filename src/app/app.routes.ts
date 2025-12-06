import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sales',
    loadChildren: () => import('./sales/sales.routes').then((m) => m.salesRoutes),
  },
  {
    path: 'errors',
    loadChildren: () => import('./errors/errors.routes').then((m) => m.errorRoutes),
  },
  {
    path: '**',
    redirectTo: 'errors/404',
  },
];
