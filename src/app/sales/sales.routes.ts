import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { CatalogPage } from './pages/catalog-page/catalog-page';

export const salesRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardPage,
  },
  {
    path: 'catalog',
    component: CatalogPage,
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
