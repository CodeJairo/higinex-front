import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { DemoService } from '../../../shared/services/demo.service';
import {
  CircleQuestionMark,
  CircleUser,
  Heart,
  LogOut,
  LucideAngularModule,
  MapPin,
  Package,
  User,
} from 'lucide-angular';

@Component({
  selector: 'sales-customer-user-menu',
  imports: [LucideAngularModule],
  templateUrl: './customer-user-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerUserMenu {
  private readonly router = inject(Router);
  private readonly demoService = inject(DemoService);

  readonly isDemoMode = this.demoService.isDemoMode;

  // Icons
  readonly userIcon = User;
  readonly userCircleIcon = CircleUser;
  readonly packageIcon = Package;
  readonly mapPinIcon = MapPin;
  readonly helpIcon = CircleQuestionMark;
  readonly logoutIcon = LogOut;

  // Inputs funcionales
  @Input() userName!: string;
  @Input() userDetail!: string;

  @Output() logout = new EventEmitter<void>();

  goToMyAddresses(): void {
    this.router.navigateByUrl('/customer/addresses');
  }

  goToMyAccount(): void {
    this.router.navigateByUrl('/customer/profile');
  }

  onLogout() {
    this.logout.emit();
  }

  goToMyOrders(): void {
    this.router.navigateByUrl('/customer/orders');
  }
}
