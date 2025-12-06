import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArrowRight, Eye, EyeOff, Lock, LucideAngularModule, Mail } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-login-page',
  imports: [LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Icons
  readonly mailIcon = Mail;
  readonly lockIcon = Lock;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly arrowRightIcon = ArrowRight;

  // Form state
  email = signal('');
  password = signal('');
  showPassword = signal(false);

  // Loading state from service
  readonly isLoading = this.authService.isLoading;

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    const success = await this.authService.login(this.email(), this.password());
    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
