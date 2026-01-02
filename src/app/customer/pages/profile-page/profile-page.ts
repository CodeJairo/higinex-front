import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
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

  // Icons
  readonly checkCircleIcon = CheckCircle;
  readonly alertCircleIcon = AlertCircle;
  readonly userIcon = User;
  readonly mailIcon = Mail;
  readonly smartphoneIcon = Smartphone;
  readonly shieldLockIcon = Shield; // Replaced ShieldLock with Shield as requested by linter
  readonly lockIcon = Lock;
  readonly calendarIcon = Calendar;
  readonly shieldIcon = Shield;
  readonly keyIcon = Key;
  readonly logOutIcon = LogOut;
  readonly settingsIcon = Settings;
  readonly mapPinIcon = MapPin;
  readonly paletteIcon = Palette;

  // Mock: lo ideal es que esto venga de tu AuthService / endpoint
  private readonly initialProfile: CustomerProfile = {
    name: 'Daniel Herrera',
    email: 'daniel@example.com',
    phone: '+57 300 123 4567',
    documentType: 'CC',
    documentNumber: '1234567890',
    emailVerified: true,
    createdAt: '2024-10-15T12:00:00.000Z',
  };

  profile = signal<CustomerProfile>({ ...this.initialProfile });

  isSaving = signal(false);

  ngOnInit(): void {
    // Más adelante: cargar perfil real desde un servicio si lo necesitas
  }

  get isDirty(): boolean {
    const value = this.profile();
    const base = this.initialProfile;
    return value.name !== base.name || value.email !== base.email || value.phone !== base.phone;
  }

  onNameChange(value: string) {
    this.profile.update((p) => ({ ...p, name: value }));
  }

  onEmailChange(value: string) {
    this.profile.update((p) => ({ ...p, email: value }));
  }

  onPhoneChange(value: string) {
    this.profile.update((p) => ({ ...p, phone: value }));
  }

  saveProfile() {
    if (!this.isDirty) return;

    this.isSaving.set(true);

    // Aquí luego llamas a tu servicio HTTP.
    // Mock:
    console.log('Guardar perfil (mock)', this.profile());

    // Simulamos que se guardó y actualizamos "initialProfile" en memoria
    // Nota: en una app real, esto actualizaría el store o recargaría datos.
    Object.assign(this.initialProfile, this.profile());

    // Simulamos delay de red
    setTimeout(() => {
      this.isSaving.set(false);
    }, 1000);
  }

  resetChanges() {
    this.profile.set({ ...this.initialProfile });
  }

  goToChangePassword() {
    // this.router.navigateByUrl('/account/change-password');
  }

  goToAddresses() {
    this.router.navigateByUrl('/customer/addresses');
  }

  goToAppearance() {
    this.router.navigateByUrl('/customer/appearance');
  }
}
