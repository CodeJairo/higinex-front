import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
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
import { CartItem } from '../../interface';
import { Router } from '@angular/router';

@Component({
  selector: 'sales-cart-dropdown',
  imports: [CommonModule, LucideAngularModule, ImageWithFallback],
  templateUrl: './cart-dropdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDropdown {
  private readonly router = inject(Router);

  @Input() isOpen = false;
  @Input() items: CartItem[] = [];
  @Output() closeCart = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<{ id: string; quantity: number }>();
  @Output() removeItem = new EventEmitter<string>();
  @Output() clearCart = new EventEmitter<void>();

  // Icons
  readonly xIcon = X;
  readonly plusIcon = Plus;
  readonly minusIcon = Minus;
  readonly trashIcon = Trash2;
  readonly bagIcon = ShoppingBag;
  readonly arrowRightIcon = ArrowRight;

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  get tax(): number {
    return this.subtotal * 0.19;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  get totalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  goToCart(): void {
    this.router.navigateByUrl('/sales/cart');
  }

  goToCheckout(): void {
    this.router.navigateByUrl('/sales/checkout');
  }

  onUpdateQuantity(id: string, quantity: number): void {
    this.updateQuantity.emit({ id, quantity: Math.max(1, quantity) });
  }
  onRemove(id: string): void {
    this.removeItem.emit(id);
  }

  onClear(): void {
    this.clearCart.emit();
  }

  onClose(): void {
    this.closeCart.emit();
  }
}
