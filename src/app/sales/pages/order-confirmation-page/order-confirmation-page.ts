import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { CircleCheckBig, Clock, LucideAngularModule, Phone, X } from 'lucide-angular';
import { CheckoutOrder, OrderStatus } from '../../interfaces';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-order-confirmation-page',
  imports: [CurrencyPipe, LucideAngularModule, DatePipe],
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
      return 'bg-amber-100 text-amber-700';
    }
    if (status === 'PAID' || status === 'PREPARING') {
      return 'bg-blue-100 text-blue-700';
    }
    if (status === 'DELIVERED') {
      return 'bg-green-100 text-green-700';
    }
    if (status === 'CANCELED') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-slate-100 text-slate-700';
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
