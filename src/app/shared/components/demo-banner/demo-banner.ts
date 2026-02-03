import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AlertTriangle, LogOut, LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../auth/services/auth.service';
import { DemoService } from '../../services/demo.service';

@Component({
  selector: 'demo-banner',
  imports: [LucideAngularModule],
  templateUrl: './demo-banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoBanner {
  private readonly authService = inject(AuthService);
  readonly demoService = inject(DemoService);

  readonly warningIcon = AlertTriangle;
  readonly logoutIcon = LogOut;

  readonly isDemoMode = this.demoService.isDemoMode;
  readonly demoEmail = this.demoService.demoEmail;
  readonly demoType = this.demoService.demoType;

  exitDemo(): void {
    this.authService.logout();
  }
}
