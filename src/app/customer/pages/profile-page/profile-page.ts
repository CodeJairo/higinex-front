import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  private router = new Router(); // si usas DI normal, cámbialo a inject(Router)

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
    (this.initialProfile as any) = { ...this.profile() };

    this.isSaving.set(false);
  }

  resetChanges() {
    this.profile.set({ ...this.initialProfile });
  }

  goToChangePassword() {
    this.router.navigateByUrl('/account/change-password');
  }

  goToAddresses() {
    this.router.navigateByUrl('/account/addresses');
  }

  goToAppearance() {
    this.router.navigateByUrl('/account/appearance');
  }
}
