import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoBanner } from '../../../shared/components/demo-banner/demo-banner';
import { AdminFooter } from '../../components/admin-footer/admin-footer';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';

@Component({
  selector: 'app-admin-layout-page',
  imports: [RouterOutlet, AdminNavbar, AdminFooter, DemoBanner],
  templateUrl: './admin-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutPage {}
