import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Info,
  LucideAngularModule,
  Map,
  NotebookPen,
  Package,
  Shield,
  Truck,
  User,
} from 'lucide-angular';
import { AuthService } from '../../../auth/services/auth.service';
import { UiEmptyStateComponent } from '../../../shared/components/ui/empty-state/empty-state.component';
import { UiLoadingStateComponent } from '../../../shared/components/ui/loading-state/loading-state.component';
import { UiPageHeaderComponent } from '../../../shared/components/ui/page-header/page-header.component';
import { CheckoutAddress, CheckoutCustomer, CreateOrderPayload } from '../../interfaces';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-checkout-page',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    LucideAngularModule,
    UiPageHeaderComponent,
    UiEmptyStateComponent,
    UiLoadingStateComponent,
  ],
  templateUrl: './checkout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly checkoutService = inject(CheckoutService);

  readonly alertIcon = CircleAlert;
  readonly userIcon = User;
  readonly mapIcon = Map;
  readonly infoIcon = Info;
  readonly noteIcon = NotebookPen;
  readonly shieldIcon = Shield;
  readonly truckIcon = Truck;
  readonly arrowLeftIcon = ArrowLeft;
  readonly arrowRightIcon = ArrowRight;
  readonly packageIcon = Package;

  readonly cartItems = this.cartService.items;
  readonly cartSummary = this.cartService.summary;
  readonly hasPriceIssues = this.cartService.hasPriceIssues;
  readonly hasStockIssues = this.cartService.hasStockIssues;

  readonly notesControl = new FormControl('', { nonNullable: true });
  readonly orderError = signal<string | null>(null);
  readonly selectedAddressId = signal('');

  private readonly addressesQuery = injectQuery(() => ({
    queryKey: ['checkout', 'addresses'],
    queryFn: () => this.checkoutService.listAddresses(),
    enabled: this.authService.isAuthenticated(),
    staleTime: 2 * 60 * 1000,
  }));

  private readonly createOrderMutation = injectMutation(() => ({
    mutationFn: (payload: CreateOrderPayload) => this.checkoutService.createOrder(payload),
  }));

  readonly customer = computed<CheckoutCustomer | null>(
    () => (this.authService.user()?.customer as CheckoutCustomer | null) ?? null
  );
  readonly addresses = computed<CheckoutAddress[]>(() => this.addressesQuery.data() ?? []);
  readonly selectedAddress = computed<CheckoutAddress | null>(() => {
    const addressId = this.selectedAddressId();
    return this.addresses().find((address) => address.id === addressId) ?? null;
  });
  readonly isAddressesLoading = computed(() => this.addressesQuery.isLoading());
  readonly hasAddressesError = computed(() => this.addressesQuery.isError());
  readonly isSubmitting = computed(() => this.createOrderMutation.isPending());
  readonly canConfirm = computed(
    () =>
      this.cartItems().length > 0 &&
      !this.hasPriceIssues() &&
      !this.hasStockIssues() &&
      !this.isSubmitting()
  );

  constructor() {
    effect(() => {
      const addresses = this.addresses();
      if (!addresses.length) {
        return;
      }

      const current = this.selectedAddressId();
      if (current && addresses.some((address) => address.id === current)) {
        return;
      }

      const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
      if (defaultAddress?.id) {
        this.selectedAddressId.set(defaultAddress.id);
      }
    });
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId.set(addressId);
  }

  goToCart(): void {
    this.router.navigateByUrl('/sales/checkout/cart');
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/sales/catalog');
  }

  async onConfirmOrder(): Promise<void> {
    if (!this.canConfirm()) {
      return;
    }

    const items = this.cartItems().map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const notes = this.notesControl.value.trim();
    const payload: CreateOrderPayload = {
      items,
      ...(this.selectedAddressId() ? { shippingAddressId: this.selectedAddressId() } : {}),
      ...(notes ? { customerNotes: notes } : {}),
    };

    this.orderError.set(null);
    try {
      const order = await this.createOrderMutation.mutateAsync(payload);
      this.cartService.clearCart();
      this.router.navigate(['/sales/checkout/order', order.id]);
    } catch (error) {
      this.orderError.set('No se pudo crear la orden. Intenta de nuevo.');
    }
  }
}
