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
  // Users Routes
  {
    path: 'users',
    loadComponent: () => import('./pages/users-list-page/users-list-page').then(m => m.UsersListPage)
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./pages/user-detail-page/user-detail-page').then(m => m.UserDetailPage)
  },
  // Customers Routes
  {
    path: 'customers',
    loadComponent: () => import('./pages/customers-list-page/customers-list-page').then(m => m.CustomersListPage)
  },
  {
    path: 'customers/:id',
    loadComponent: () => import('./pages/customer-detail-page/customer-detail-page').then(m => m.CustomerDetailPage)
  },
  // Orders Routes
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders-list-page/orders-list-page').then(m => m.OrdersListPage)
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/order-detail-page/order-detail-page').then(m => m.OrderDetailPage)
  },
  {
    path: 'inventory',
    component: InventoryLayoutPage,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './pages/inventory-summary-page/inventory-summary-page'
          ).then((m) => m.InventorySummaryPage),
      },
      {
        path: 'movements',
        loadComponent: () =>
          import(
            './pages/inventory-movements-page/inventory-movements-page'
          ).then((m) => m.InventoryMovementsPage),
      },
      {
        path: 'products',
        component: InventoryProductsPage,
      },
      {
        path: 'create-product',
        component: CreateProduct,
      },
      {
        path: 'variants/:productId',
        loadComponent: () =>
          import(
            './pages/inventory-variants-page/inventory-variants-page'
          ).then((m) => m.InventoryVariantsPage),
      },
    ],
  },

  {
    path: 'billing',
    loadComponent: () => import('./pages/billing-page/billing-page').then(m => m.BillingPage)
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
