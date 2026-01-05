import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Lock,
  LogOut,
  LucideAngularModule,
  Mail,
  MapPin,
  Palette,
  Settings,
  Shield,
  Smartphone,
  User,
} from 'lucide-angular';
import { AuthService } from '../../../auth/services/auth.service';
import { CustomerProfileService } from '../../services/customer-profile.service';

interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  emailVerified: boolean;
  createdAt: string;
}

@Component({
  selector: 'customer-profile-page',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly customerProfileService = inject(CustomerProfileService);

  // Icons
  readonly checkCircleIcon = CheckCircle;
  readonly alertCircleIcon = AlertCircle;
  readonly userIcon = User;
  readonly mailIcon = Mail;
  readonly smartphoneIcon = Smartphone;
  readonly shieldLockIcon = Shield;
  readonly lockIcon = Lock;
  readonly calendarIcon = Calendar;
  readonly shieldIcon = Shield;
  readonly keyIcon = Key;
  readonly logOutIcon = LogOut;
  readonly settingsIcon = Settings;
  readonly mapPinIcon = MapPin;
  readonly paletteIcon = Palette;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;

  // Real data signals
  readonly user = this.authService.user;

  // Editable form state initialized with user data
  readonly form = signal<CustomerProfile>({
    name: '',
    email: '',
    phone: '',
    documentType: '',
    documentNumber: '',
    emailVerified: false,
    createdAt: '',
  });

  // Change Password state
  readonly showPasswordModal = signal(false);
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly isPasswordSaving = signal(false);

  // Password visibility signals
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);

  // Computed helper to detect changes
  readonly isDirty = computed(() => {
    const user = this.user();
    if (!user?.customer) return false;

    const current = this.form();
    return current.email !== user.email || current.phone !== user.customer.phone;
  });

  // Password Validation
  readonly isValidPassword = computed(() => {
    const password = this.newPassword();
    // Min 8 chars, at least one uppercase, one lowercase, one number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    return password.length >= 8 && regex.test(password);
  });

  readonly isSaving = computed(() => this.customerProfileService.updateProfileMutation.isPending());

  constructor() {
    // Initialize form with real data when available
    effect(() => {
      const user = this.user();
      if (user && user.customer) {
        this.form.set({
          name: user.customer.name,
          email: user.email,
          phone: user.customer.phone,
          documentType: user.customer.documentType,
          documentNumber: user.customer.documentNumber,
          emailVerified: true,
          createdAt: user.customer.createdAt
        });
      }
    });
  }

  ngOnInit(): void {
  }

  onEmailChange(value: string) {
    this.form.update((p) => ({ ...p, email: value }));
  }

  onPhoneChange(value: string) {
    this.form.update((p) => ({ ...p, phone: value }));
  }

  async saveProfile() {
    if (!this.isDirty()) return;

    const success = await this.customerProfileService.updateProfile({
      email: this.form().email,
      phone: this.form().phone,
    });

    // Toast or notification could go here
  }

  resetChanges() {
    const user = this.user();
    if (user && user.customer) {
      this.form.set({
        name: user.customer.name,
        email: user.email,
        phone: user.customer.phone,
        documentType: user.customer.documentType,
        documentNumber: user.customer.documentNumber,
        emailVerified: true,
        createdAt: user.customer.createdAt
      });
    }
  }

  // Password Change Logic
  openPasswordModal() {
    this.currentPassword.set('');
    this.newPassword.set('');
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showPasswordModal.set(true);
  }

  closePasswordModal() {
    this.showPasswordModal.set(false);
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword.update(v => !v);
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.update(v => !v);
  }

  async savePassword() {
    if (!this.isValidPassword()) return;

    this.isPasswordSaving.set(true);
    const success = await this.authService.changePassword({
      currentPassword: this.currentPassword(),
      newPassword: this.newPassword()
    });
    this.isPasswordSaving.set(false);

    if (success) {
      this.closePasswordModal();
      // Could add success toast here
    }
  }

  goToChangePassword() {
    this.openPasswordModal();
  }

  logoutOtherSessions() {
    alert('Esta funcionalidad estará disponible en futuras versiones.');
  }

  matchesRegex(value: string, pattern: string): boolean {
    return new RegExp(pattern).test(value);
  }

  goToAddresses() {
    this.router.navigateByUrl('/customer/addresses');
  }

  goToAppearance() {
    this.router.navigateByUrl('/customer/appearance');
  }
}
