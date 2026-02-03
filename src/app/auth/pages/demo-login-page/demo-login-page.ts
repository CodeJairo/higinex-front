import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  CircleAlert,
  LucideAngularModule,
  Mail,
  Play,
  UserCog,
  X,
} from 'lucide-angular';
import { DemoUserType } from '../../../shared/services/demo.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-demo-login-page',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './demo-login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoLoginPage {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  readonly emailIcon = Mail;
  readonly userIcon = UserCog;
  readonly playIcon = Play;
  readonly backIcon = ArrowLeft;
  readonly errorIcon = CircleAlert;
  readonly closeIcon = X;

  // Form state
  readonly submitted = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    email: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
    type: this.formBuilder.nonNullable.control<DemoUserType>('user', [
      Validators.required,
    ]),
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { email, type } = this.form.getRawValue();
    const success = await this.authService.loginAsDemo(type, email.trim());

    this.isLoading.set(false);

    if (success) {
      // Redirect based on demo type
      const target = type === 'admin' ? '/admin/dashboard' : '/sales';
      this.router.navigateByUrl(target);
    } else {
      this.errorMessage.set(
        this.authService.loginError() ?? 'No se pudo iniciar el modo demo. Intenta de nuevo.'
      );
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  dismissError(): void {
    this.errorMessage.set(null);
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
