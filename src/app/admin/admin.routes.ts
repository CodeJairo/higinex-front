import { Routes } from '@angular/router';
import { roleMatchGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/interfaces';
import { InventoryLayoutPage } from './layouts/inventory-layout-page/inventory-layout-page';
import { CreateProduct } from './pages/create-product/create-product';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { InventoryProductsPage } from './pages/inventory-products-page/inventory-products-page';
import { RegisterPage } from './pages/register-page/register-page';

export const adminRoutes: Routes = [
  {
    path: 'register',
    canMatch: [roleMatchGuard],
    data: {
      roles: [Role.ADMIN],
    },
    component: RegisterPage,
  },
  {
    path: 'dashboard',
    canMatch: [roleMatchGuard],
    data: {
      roles: [Role.ADMIN],
    },
    component: DashboardPage,
  },
  {
    path: 'inventory',
    canMatch: [roleMatchGuard],
    data: {
      roles: [Role.ADMIN],
    },
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
