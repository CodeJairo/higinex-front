import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerNavbar } from '../../components/customer-navbar/customer-navbar';
import { CustomerSidebar } from '../../components/customer-sidebar/customer-sidebar';

@Component({
  selector: 'app-customer-layout-page',
  imports: [CustomerNavbar, CustomerSidebar, RouterOutlet],
  templateUrl: './customer-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerLayoutPage {}
