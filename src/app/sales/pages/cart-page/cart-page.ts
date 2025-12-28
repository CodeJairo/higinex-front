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

@Component({
  selector: 'customer-cart-page',
  imports: [CurrencyPipe, LucideAngularModule],
  templateUrl: './cart-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

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
    if (this.hasPriceIssues() || this.hasStockIssues()) {
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

  removeItem(item: CheckoutCartItem): void {
    this.cartService.removeItem(item.variantId);
  }
}
