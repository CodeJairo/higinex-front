import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ArrowLeft, House, LucideAngularModule, Package, Search } from 'lucide-angular';

@Component({
  selector: 'errors-not-found-page',
  imports: [LucideAngularModule],
  templateUrl: './not-found-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  private router = inject(Router);

  readonly homeIcon = House;
  readonly searchIcon = Search;
  readonly packageIcon = Package;
  readonly arrowLeftIcon = ArrowLeft;

  goToDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  goBack(): void {
    window.history.back();
  }
}
