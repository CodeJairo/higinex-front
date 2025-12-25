import { Routes } from '@angular/router';
import { RegisterPage } from './pages/register-page/register-page';
import { roleMatchGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/interfaces';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';

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
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
