import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  LucideAngularModule,
  Mail,
  Search,
  Send,
  ShoppingCart,
  X,
  Lock
} from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-login-page',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);

  readonly emailIcon = Mail;
  readonly lockIcon = Lock;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly searchIcon = Search;
  readonly cartIcon = ShoppingCart;
  readonly backIcon = ArrowLeft;
  readonly sendIcon = Send;
  readonly successIcon = CircleCheck;
  readonly errorIcon = CircleAlert;
  readonly closeIcon = X;

  // Form state
  readonly showPassword = signal(false);
  readonly submitted = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    email: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this.formBuilder.nonNullable.control('', [Validators.required]),
  });

  // Loading state from service
  readonly isLoginLoading = this.authService.isLoginLoading;
  readonly loginError = this.authService.loginError;

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

  goToDemo(): void {
    this.router.navigate(['/demo']);
  }

  dismissError(): void {
    this.authService.clearLoginError();
  }

  showError(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  hasError(path: string, error: string): boolean {
    const control = this.form.get(path);
    return !!control && control.hasError(error);
  }
}
