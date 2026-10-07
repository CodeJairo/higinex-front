import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  EyeOff,
  Lock,
  LucideAngularModule,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-angular';
import { DemoUserType } from '../../../shared/services/demo.service';
import { AUTH_SHOWCASE_PRODUCTS, ShowcaseProduct } from '../../interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-login-page',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  // Iconos
  readonly emailIcon = Mail;
  readonly lockIcon = Lock;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly shieldIcon = ShieldCheck;
  readonly buildingIcon = Building2;
  readonly arrowRightIcon = ArrowRight;
  readonly arrowUpRightIcon = ArrowUpRight;
  readonly errorIcon = CircleAlert;
  readonly closeIcon = X;
  readonly sparklesIcon = Sparkles;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;

  // Showcase de productos reales
  readonly showcaseProducts: readonly ShowcaseProduct[] = AUTH_SHOWCASE_PRODUCTS;
  readonly currentProductIndex = signal(0);
  readonly currentProduct = computed(
    () => this.showcaseProducts[this.currentProductIndex()],
  );
  private carouselTimer?: ReturnType<typeof setInterval>;

  // Estado demo de 1 clic
  readonly loadingDemoType = signal<DemoUserType | null>(null);

  // Año actual para pie institucional
  readonly currentYear = new Date().getFullYear();

  // Estado del formulario
  readonly showPassword = signal(false);
  readonly submitted = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    email: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this.formBuilder.nonNullable.control('', [Validators.required]),
  });

  // Estado de autenticación derivado del servicio
  readonly isLoginLoading = this.authService.isLoginLoading;
  readonly loginError = this.authService.loginError;

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

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    const success = await this.authService.login(email.trim(), password);
    if (success) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const target = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/sales';
      this.router.navigateByUrl(target);
    }
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  async selectDemo(type: DemoUserType): Promise<void> {
    this.loadingDemoType.set(type);
    const email = type === 'admin' ? 'admin-demo@higinex.com' : 'cliente-demo@higinex.com';
    const success = await this.authService.loginAsDemo(type, email);
    if (success) {
      const target = type === 'admin' ? '/admin/dashboard' : '/sales';
      this.router.navigateByUrl(target);
    } else {
      this.loadingDemoType.set(null);
    }
  }

  goToDemo(): void {
    this.router.navigate(['/demo']);
  }

  dismissError(): void {
    this.authService.clearLoginError();
  }

  showError(path: 'email' | 'password'): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  hasError(path: 'email' | 'password', error: string): boolean {
    const control = this.form.get(path);
    return !!control && control.hasError(error);
  }
}
