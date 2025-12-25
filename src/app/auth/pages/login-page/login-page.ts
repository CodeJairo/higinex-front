import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private router = inject(Router);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);

  // Form state
  readonly showPassword = signal(false);
  readonly submitted = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    email: this.formBuilder.nonNullable.control('admin@mail.com', [
      Validators.required,
      Validators.email,
    ]),
    password: this.formBuilder.nonNullable.control('c+1>=pI99M>m', [Validators.required]),
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
      this.router.navigateByUrl('/sales');
    }
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
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
