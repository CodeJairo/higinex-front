import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';

export const salesRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardPage,
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
