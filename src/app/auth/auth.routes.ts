import { Routes } from '@angular/router';
import { ForgotPasswordPage } from './pages/forgot-password-page/forgot-password-page';
import { LoginPage } from './pages/login-page/login-page';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },

  {
    path: 'forgot-password',
    component: ForgotPasswordPage,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
