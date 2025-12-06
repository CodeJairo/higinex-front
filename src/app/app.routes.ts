import { Routes } from '@angular/router';
import { SalesLayoutPage } from './sales/Layouts/sales-layout-page/sales-layout-page';

export const routes: Routes = [
  {
    path: 'sales',
    component: SalesLayoutPage,
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
