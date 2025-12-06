import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { House, LucideAngularModule, RefreshCw, TriangleAlert } from 'lucide-angular';

@Component({
  selector: 'errors-server-error-page',
  imports: [LucideAngularModule],
  templateUrl: './server-error-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerErrorPage {
  router = inject(Router);

  readonly homeIcon = House;
  readonly refreshIcon = RefreshCw;
  readonly alertIcon = TriangleAlert;

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  refresh(): void {
    window.location.reload();
  }
}
