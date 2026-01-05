import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Lock,
  LucideAngularModule,
  Mail,
  Search,
  Send,
  ShoppingCart,
  X,
} from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-forgot-password-page',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './forgot-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private router = inject(Router);
  private authService = inject(AuthService);

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
  step = signal<'EMAIL' | 'OTP_NEW_PASSWORD' | 'SUCCESS'>('EMAIL');
  email = signal('');
  code = signal('');
  newPassword = signal('');

  // Computed helpers for template
  readonly isSuccess = computed(() => this.step() === 'SUCCESS');

  // Loading state from service
  readonly isLoading = this.authService.isLoading;

  async onSubmit(): Promise<void> {
    if (this.step() === 'EMAIL') {
      await this.handleEmailStep();
    } else if (this.step() === 'OTP_NEW_PASSWORD') {
      await this.handleResetStep();
    }
  }

  private async handleEmailStep(): Promise<void> {
    const success = await this.authService.sendPasswordRecovery(this.email());
    if (success) {
      this.step.set('OTP_NEW_PASSWORD');
    }
  }

  private async handleResetStep(): Promise<void> {
    const success = await this.authService.resetPassword({
      email: this.email(),
      code: this.code(),
      newPassword: this.newPassword(),
    });
    if (success) {
      this.step.set('SUCCESS');
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
  }
}
