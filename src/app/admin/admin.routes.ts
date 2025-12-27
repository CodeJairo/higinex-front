import { Routes } from '@angular/router';
import { InventoryLayoutPage } from './layouts/inventory-layout-page/inventory-layout-page';
import { ContractsPage } from './pages/contracts-page/contracts-page';
import { CreateProduct } from './pages/create-product/create-product';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { InventoryProductsPage } from './pages/inventory-products-page/inventory-products-page';
import { RegisterPage } from './pages/register-page/register-page';

export const adminRoutes: Routes = [
  {
    path: 'register',
    component: RegisterPage,
  },
  {
    path: 'dashboard',
    component: DashboardPage,
  },
  {
    path: 'contracts',
    component: ContractsPage,
  },
  {
    path: 'inventory',
    component: InventoryLayoutPage,
    children: [
      {
        path: 'products',
        component: InventoryProductsPage,
      },
      {
        path: 'create-product',
        component: CreateProduct,
      },
    ],
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
