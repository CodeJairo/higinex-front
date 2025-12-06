import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { Check, LucideAngularModule, Package, ShoppingCart } from 'lucide-angular';
import { ImageWithFallback } from '../../../shared/components/image-with-fallback/image-with-fallback';
import { Product } from '../../interface';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, LucideAngularModule, ImageWithFallback],
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);

  // Icons
  readonly cartIcon = ShoppingCart;
  readonly packageIcon = Package;
  readonly checkIcon = Check;

  isAdded = signal(false);

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  addToCart(): void {
    this.cartService.addItem({
      id: this.product.id,
      name: this.product.name,
      presentation: this.product.presentation,
      unitPrice: this.product.price,
      image: this.product.image,
    });

    this.isAdded.set(true);
    setTimeout(() => this.isAdded.set(false), 2000);
  }
}
