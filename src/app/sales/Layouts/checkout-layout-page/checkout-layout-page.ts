import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ArrowLeft, Check, LucideAngularModule } from 'lucide-angular';
import { DemoBanner } from '../../../shared/components/demo-banner/demo-banner';

@Component({
  selector: 'app-checkout-layout-page',
  imports: [RouterOutlet, LucideAngularModule, DemoBanner],
  templateUrl: './checkout-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutLayoutPage {
  currentStep = 1;

  readonly checkIcon = Check;
  readonly arrowLeftIcon = ArrowLeft;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      if (this.router.url.includes('cart')) this.currentStep = 1;
      if (this.router.url.includes('confirm')) this.currentStep = 2;
      if (this.router.url.includes('order')) this.currentStep = 3;
    });
  }

  getStepClass(step: number) {
    if (this.currentStep === step)
      return 'bg-linear-to-tr from-primary to-emerald-500 text-white shadow-xs shadow-primary/30 font-bold';
    if (this.currentStep > step)
      return 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 font-bold';
    return 'bg-base-200/70 text-base-content/40 font-semibold';
  }

  goToCatalog() {
    this.router.navigateByUrl('/sales/catalog');
  }
}
