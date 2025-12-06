import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'errors',
    loadChildren: () => import('./errors/errors.routes').then((m) => m.errorRoutes),
  },
  {
    path: '**',
    redirectTo: 'errors/404',
  },
];
