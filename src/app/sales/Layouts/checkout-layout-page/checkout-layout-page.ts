import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Check, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-checkout-layout-page',
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './checkout-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutLayoutPage {
  currentStep = 1;

  readonly checkIcon = Check;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      if (this.router.url.includes('cart')) this.currentStep = 1;
      if (this.router.url.includes('confirm')) this.currentStep = 2;
      if (this.router.url.includes('order')) this.currentStep = 3;
    });
  }

  getStepClass(step: number) {
    if (this.currentStep === step)
      return 'bg-primary text-white shadow-lg shadow-primary/30 scale-110';
    if (this.currentStep > step) return 'bg-green-500 text-white';
    return 'bg-slate-100 text-slate-400';
  }

  goToCatalog() {
    this.router.navigateByUrl('/sales/catalog');
  }
}
