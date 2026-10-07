import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Lock,
  LucideAngularModule,
  Mail,
  X,
} from 'lucide-angular';
import { AUTH_SHOWCASE_PRODUCTS, ShowcaseProduct } from '../../interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-forgot-password-page',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './forgot-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly emailIcon = Mail;
  readonly lockIcon = Lock;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly backIcon = ArrowLeft;
  readonly arrowRightIcon = ArrowRight;
  readonly arrowUpRightIcon = ArrowUpRight;
  readonly successIcon = CircleCheck;
  readonly errorIcon = CircleAlert;
  readonly closeIcon = X;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;

  // Showcase de productos reales
  readonly showcaseProducts: readonly ShowcaseProduct[] = AUTH_SHOWCASE_PRODUCTS;
  readonly currentProductIndex = signal(0);
  readonly currentProduct = computed(
    () => this.showcaseProducts[this.currentProductIndex()],
  );
  private carouselTimer?: ReturnType<typeof setInterval>;

  // Año actual para pie institucional
  readonly currentYear = new Date().getFullYear();

  // Estado del flujo
  readonly step = signal<'EMAIL' | 'OTP_NEW_PASSWORD' | 'SUCCESS'>('EMAIL');
  readonly email = signal('');
  readonly code = signal('');
  readonly newPassword = signal('');
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Computed helpers para plantilla
  readonly isSuccess = computed(() => this.step() === 'SUCCESS');

  readonly isValidPassword = computed(() => {
    const password = this.newPassword();
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    return password.length >= 8 && regex.test(password);
  });

  // Estado de carga derivado del servicio
  readonly isLoading = this.authService.isLoading;

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  startCarousel(): void {
    this.stopCarousel();
    this.carouselTimer = setInterval(() => {
      this.currentProductIndex.update(
        (idx) => (idx + 1) % this.showcaseProducts.length,
      );
    }, 4500);
  }

  stopCarousel(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = undefined;
    }
  }

  setProduct(index: number): void {
    this.currentProductIndex.set(index);
    this.startCarousel();
  }

  prevProduct(): void {
    this.currentProductIndex.update(
      (idx) =>
        (idx - 1 + this.showcaseProducts.length) % this.showcaseProducts.length,
    );
    this.startCarousel();
  }

  nextProduct(): void {
    this.currentProductIndex.update(
      (idx) => (idx + 1) % this.showcaseProducts.length,
    );
    this.startCarousel();
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    if (this.step() === 'EMAIL') {
      await this.handleEmailStep();
    } else if (this.step() === 'OTP_NEW_PASSWORD') {
      if (!this.isValidPassword()) return;
      await this.handleResetStep();
    }
  }

  private async handleEmailStep(): Promise<void> {
    const result = await this.authService.sendPasswordRecovery(this.email().trim());
    if (result.success) {
      this.step.set('OTP_NEW_PASSWORD');
    } else {
      this.errorMessage.set(
        result.message || 'Este correo no está registrado en el sistema. Verifique la dirección o contacte a su gestor comercial.',
      );
    }
  }

  private async handleResetStep(): Promise<void> {
    const success = await this.authService.resetPassword({
      email: this.email().trim(),
      code: this.code().trim(),
      newPassword: this.newPassword(),
    });
    if (success) {
      this.step.set('SUCCESS');
    } else {
      this.errorMessage.set('El código de verificación es inválido o ha expirado. Verifique e intente nuevamente.');
    }
  }

  goToLogin(): void {
    this.resetForm();
    this.router.navigate(['/auth/login']);
  }

  resetForm(): void {
    this.step.set('EMAIL');
    this.email.set('');
    this.code.set('');
    this.newPassword.set('');
    this.showPassword.set(false);
    this.errorMessage.set(null);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  matchesRegex(value: string, pattern: string): boolean {
    return new RegExp(pattern).test(value);
  }
}
