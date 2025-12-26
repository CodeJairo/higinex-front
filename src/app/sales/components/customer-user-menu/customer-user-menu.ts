import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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

  onLogout() {
    this.logout.emit();
  }
}
