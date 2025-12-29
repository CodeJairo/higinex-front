import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Lock,
  LucideAngularModule,
  Package,
  Shield,
  Trash,
  X,
} from 'lucide-angular';
import { CheckoutCartItem } from '../../interfaces';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';
import { ImageWithFallback } from '../../../shared/components/image-with-fallback/image-with-fallback';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

@Component({
  selector: 'customer-cart-page',
  imports: [CurrencyPipe, LucideAngularModule, ImageWithFallback],
  templateUrl: './cart-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly catalogService = inject(CatalogService);

  getItemImageUrl(item: CheckoutCartItem): string {
    const image = item.images?.[0];
    if (image?.id) {
      return this.catalogService.buildVariantImageUrl(item.variantId, image.id);
    }
    return PLACEHOLDER_IMAGE;
  }

  getItemImageAlt(item: CheckoutCartItem): string {
    const image = item.images?.[0];
    return image?.altText ?? item.productName;
  }

  readonly arrowLeftIcon = ArrowLeft;
  readonly trashIcon = Trash;
  readonly arrowRightIcon = ArrowRight;
  readonly lockIcon = Lock;
  readonly xIcon = X;
  readonly infoIcon = Info;
  readonly shieldCheckIcon = Shield;
  readonly packageIcon = Package;

  readonly cartItems = this.cartService.items;
  readonly cartSummary = this.cartService.summary;
  readonly hasPriceIssues = this.cartService.hasPriceIssues;
  readonly hasStockIssues = this.cartService.hasStockIssues;

  goToCatalog(): void {
    this.router.navigateByUrl('/sales/catalog');
  }

  goToCheckout(): void {
    if (this.cartItems().length === 0 || this.hasPriceIssues() || this.hasStockIssues()) {
      return;
    }
    this.router.navigateByUrl('/sales/checkout/confirm');
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  decreaseQty(item: CheckoutCartItem): void {
    this.cartService.updateQuantity(item.variantId, item.quantity - 1);
  }

  increaseQty(item: CheckoutCartItem): void {
    this.cartService.updateQuantity(item.variantId, item.quantity + 1);
  }

  onQuantityChange(item: CheckoutCartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!isNaN(value) && value >= 1) {
      this.cartService.updateQuantity(item.variantId, value);
    } else {
      // Reset to 1 if invalid
      this.cartService.updateQuantity(item.variantId, 1);
      input.value = '1';
    }
  }

  removeItem(item: CheckoutCartItem): void {
    this.cartService.removeItem(item.variantId);
  }
}
