import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  CircleUser,
  FileText,
  LogOut,
  LucideAngularModule,
  Package,
  Settings,
  ShieldUser,
  User,
} from 'lucide-angular';

@Component({
  selector: 'sales-admin-user-menu',
  imports: [LucideAngularModule],
  templateUrl: './admin-user-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserMenu {
  private router = inject(Router);

  // Icons
  readonly userIcon = User;
  readonly userCircleIcon = CircleUser;
  readonly settingsIcon = Settings;
  readonly packageIcon = Package;
  readonly fileTextIcon = FileText;
  readonly logoutIcon = LogOut;
  readonly shieldUserIcon = ShieldUser;
  // Inputs funcionales
  @Input() userName!: string;
  @Input() userDetail!: string;

  @Output() logout = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }

  navigateToDashboard(): void {
    this.router.navigateByUrl('admin/dashboard');
  }
}
