import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  email = signal('');
  isSuccess = signal(false);

  // Loading state from service
  readonly isLoading = this.authService.isLoading;

  async onSubmit(): Promise<void> {
    const success = await this.authService.sendPasswordRecovery(this.email());
    if (success) {
      this.isSuccess.set(true);
    }
  }

  goToLogin(): void {
    this.isSuccess.set(false);
    this.email.set('');
    this.router.navigate(['/auth/login']);
  }

  resetForm(): void {
    this.isSuccess.set(false);
    this.email.set('');
  }
}
