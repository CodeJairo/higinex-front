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
  email = signal('admin@mail.com');
  password = signal('c+1>=pI99M>m');
  showPassword = signal(true);

  // Loading state from service
  readonly isLoginLoading = this.authService.isLoginLoading;
  readonly loginError = this.authService.loginError;

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    const success = await this.authService.login(this.email(), this.password());
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
}
