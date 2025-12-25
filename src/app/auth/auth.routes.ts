import { Routes } from '@angular/router';
import { guestMatchGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';
import { Role } from './interfaces';
import { ForgotPasswordPage } from './pages/forgot-password-page/forgot-password-page';
import { LoginPage } from './pages/login-page/login-page';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canMatch: [guestMatchGuard],
  },

  {
    path: 'forgot-password',
    component: ForgotPasswordPage,
    canMatch: [guestMatchGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
