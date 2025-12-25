import { Routes } from '@angular/router';
import { CatalogPage } from './pages/catalog-page/catalog-page';

export const salesRoutes: Routes = [
  {
    path: 'catalog',
    component: CatalogPage,
  },
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },
];
