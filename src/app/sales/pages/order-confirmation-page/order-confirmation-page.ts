import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ArrowLeft, ArrowRight, Bookmark, CircleCheckBig, Clock, LucideAngularModule, Map, Phone, X } from 'lucide-angular';
import { CheckoutOrder, OrderStatus } from '../../interfaces';
import { CheckoutService } from '../../services/checkout.service';
import { OrderStatusLabelPipe } from '../../../shared/pipes/order-status-label.pipe';
import { UiEmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { UiLoadingStateComponent } from '../../../shared/components/ui/loading-state/loading-state.component';

@Component({
  selector: 'app-order-confirmation-page',
  imports: [
    CurrencyPipe,
    LucideAngularModule,
    DatePipe,
    OrderStatusLabelPipe,
    UiEmptyStateComponent,
    UiLoadingStateComponent,
  ],
  templateUrl: './order-confirmation-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly checkoutService = inject(CheckoutService);

  readonly checkCircleIcon = CircleCheckBig;
  readonly clockIcon = Clock;
  readonly xIcon = X;
  readonly phoneIcon = Phone;
  readonly mapIcon = Map;
  readonly bookmarkIcon = Bookmark;
  readonly arrowRightIcon = ArrowRight;
  readonly arrowLeftIcon = ArrowLeft;

  readonly orderId = signal(this.route.snapshot.paramMap.get('orderId') ?? '');

  private readonly orderQuery = injectQuery(() => ({
    queryKey: ['orders', this.orderId()],
    queryFn: () => this.checkoutService.getOrder(this.orderId()),
    enabled: !!this.orderId(),
    retry: false,
    staleTime: 60 * 1000,
  }));

  readonly order = computed<CheckoutOrder | null>(() => this.orderQuery.data() ?? null);
  readonly isLoading = computed(() => this.orderQuery.isLoading());
  readonly hasError = computed(() => this.orderQuery.isError());
  readonly shouldShowReservationExpiresAt = computed(() => {
    const order = this.order();
    if (!order) {
      return false;
    }
    return order.status === 'CREATED' || order.status === 'PENDING_PAYMENT';
  });

  getStatusBadgeClass(status: OrderStatus): string {
    if (status === 'CREATED' || status === 'PENDING_PAYMENT') {
      return 'badge-warning text-warning-content';
    }
    if (status === 'PAID' || status === 'PREPARING') {
      return 'badge-info text-info-content';
    }
    if (status === 'DELIVERED') {
      return 'badge-success text-success-content';
    }
    if (status === 'CANCELED') {
      return 'badge-error text-error-content';
    }
    return 'badge-ghost text-base-content/70';
  }



  toAmount(value: string | number | null | undefined): number {
    if (value == null) {
      return 0;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  retryLoad(): void {
    this.orderQuery.refetch();
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/sales/catalog');
  }
}
