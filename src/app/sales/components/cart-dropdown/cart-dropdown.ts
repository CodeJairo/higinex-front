import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  ArrowRight,
  LucideAngularModule,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-angular';
import { ImageWithFallback } from '../../../shared/components/image-with-fallback/image-with-fallback';
import { CheckoutCartItem } from '../../interfaces';
import { Router } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

@Component({
  selector: 'sales-cart-dropdown',
  imports: [LucideAngularModule, ImageWithFallback],
  templateUrl: './cart-dropdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDropdown {
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);

  readonly isOpen = input(false);
  readonly items = input<CheckoutCartItem[]>([]);
  readonly closeCart = output<void>();
  readonly updateQuantity = output<{ variantId: string; quantity: number }>();
  readonly removeItem = output<string>();
  readonly clearCart = output<void>();

  // Icons
  readonly xIcon = X;
  readonly plusIcon = Plus;
  readonly minusIcon = Minus;
  readonly trashIcon = Trash2;
  readonly bagIcon = ShoppingBag;
  readonly arrowRightIcon = ArrowRight;

  readonly totalValue = computed(() =>
    this.items().reduce((sum, item) => sum + (item.unitPriceCop ?? 0) * item.quantity, 0),
  );

  readonly tax = computed(() => Math.round(this.totalValue() - this.totalValue() / 1.19));

  readonly subtotal = computed(() => this.totalValue() - this.tax());

  readonly total = computed(() => this.totalValue());

  readonly totalItems = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  getItemImageUrl(item: CheckoutCartItem): string {
    const image = item.images?.[0];
    if (image?.id) {
      return image.url ?? this.catalogService.buildVariantImageUrl(item.variantId, image.id);
    }
    return PLACEHOLDER_IMAGE;
  }

  getItemImageAlt(item: CheckoutCartItem): string {
    const image = item.images?.[0];
    return image?.altText ?? item.productName;
  }

  goToCart(): void {
    this.router.navigateByUrl('/sales/checkout/cart');
  }

  goToCheckout(): void {
    this.router.navigateByUrl('/sales/checkout/confirm');
  }

  onUpdateQuantity(variantId: string, quantity: number): void {
    this.updateQuantity.emit({ variantId, quantity: Math.max(1, quantity) });
  }

  onQuantityChange(variantId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!isNaN(value) && value >= 1) {
      this.onUpdateQuantity(variantId, value);
    } else {
      // Reset to 1 if invalid
      this.onUpdateQuantity(variantId, 1);
      input.value = '1';
    }
  }
  onRemove(variantId: string): void {
    this.removeItem.emit(variantId);
  }

  onClear(): void {
    this.clearCart.emit();
  }

  onClose(): void {
    this.closeCart.emit();
  }
}
