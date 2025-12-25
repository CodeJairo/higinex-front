import { Routes } from '@angular/router';
import { RegisterPage } from './pages/register-page/register-page';
import { roleMatchGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/interfaces';

export const adminRoutes: Routes = [
  {
    path: 'register',
    canMatch: [roleMatchGuard],
    data: {
      roles: [Role.ADMIN],
    },
    component: RegisterPage,
  },
];
