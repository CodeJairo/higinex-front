import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminFooter } from '../../components/admin-footer/admin-footer';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';

@Component({
  selector: 'app-admin-layout-page',
  imports: [RouterOutlet, AdminNavbar, AdminFooter],
  templateUrl: './admin-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutPage {}
