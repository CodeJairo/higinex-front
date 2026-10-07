import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LucideAngularModule,
  ShieldCheck,
  X,
} from 'lucide-angular';
import { DemoUserType } from '../../../shared/services/demo.service';
import { AUTH_SHOWCASE_PRODUCTS, ShowcaseProduct } from '../../interfaces';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-demo-login-page',
  imports: [LucideAngularModule],
  templateUrl: './demo-login-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoLoginPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly backIcon = ArrowLeft;
  readonly arrowRightIcon = ArrowRight;
  readonly buildingIcon = Building2;
  readonly shieldIcon = ShieldCheck;
  readonly errorIcon = CircleAlert;
  readonly closeIcon = X;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;

  // Showcase de productos reales
  readonly showcaseProducts: readonly ShowcaseProduct[] = AUTH_SHOWCASE_PRODUCTS;
  readonly currentProductIndex = signal(0);
  readonly currentProduct = computed(
    () => this.showcaseProducts[this.currentProductIndex()],
  );
  private carouselTimer?: ReturnType<typeof setInterval>;

  // Año actual para pie institucional
  readonly currentYear = new Date().getFullYear();

  // Estado del flujo
  readonly loadingType = signal<DemoUserType | null>(null);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  startCarousel(): void {
    this.stopCarousel();
    this.carouselTimer = setInterval(() => {
      this.currentProductIndex.update(
        (idx) => (idx + 1) % this.showcaseProducts.length,
      );
    }, 4500);
  }

  stopCarousel(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = undefined;
    }
  }

  setProduct(index: number): void {
    this.currentProductIndex.set(index);
    this.startCarousel();
  }

  prevProduct(): void {
    this.currentProductIndex.update(
      (idx) =>
        (idx - 1 + this.showcaseProducts.length) % this.showcaseProducts.length,
    );
    this.startCarousel();
  }

  nextProduct(): void {
    this.currentProductIndex.update(
      (idx) => (idx + 1) % this.showcaseProducts.length,
    );
    this.startCarousel();
  }

  async selectDemo(type: DemoUserType): Promise<void> {
    this.errorMessage.set(null);
    this.loadingType.set(type);

    const email = type === 'admin' ? 'admin-demo@higinex.com' : 'cliente-demo@higinex.com';
    const success = await this.authService.loginAsDemo(type, email);

    if (success) {
      const target = type === 'admin' ? '/admin/dashboard' : '/sales';
      this.router.navigateByUrl(target);
    } else {
      this.loadingType.set(null);
      this.errorMessage.set(
        this.authService.loginError() ?? 'No se pudo iniciar el modo demo. Intenta de nuevo.',
      );
    }
  }

  goToLogin(): void {
    this.authService.clearLoginError();
    this.router.navigate(['/auth/login']);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }
}
