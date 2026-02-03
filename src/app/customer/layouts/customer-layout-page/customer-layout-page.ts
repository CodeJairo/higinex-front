import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoBanner } from '../../../shared/components/demo-banner/demo-banner';
import { CustomerNavbar } from '../../components/customer-navbar/customer-navbar';
import { CustomerSidebar } from '../../components/customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-layout-page',
  imports: [CustomerNavbar, CustomerSidebar, RouterOutlet, DemoBanner],
  templateUrl: './customer-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerLayoutPage {}
