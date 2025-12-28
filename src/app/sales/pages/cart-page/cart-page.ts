import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Lock,
  LucideAngularComponent,
  LucideAngularModule,
  Package,
  Shield,
  Trash,
  X,
} from 'lucide-angular';

interface CartItem {
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  attributes: Record<string, string>;
  imageUrl: string;
  unitPriceCop: number | null;
  quantity: number;
  inventory: {
    onHand: number;
    reserved: number;
  };
}

interface CartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  hasPriceIssues: boolean;
  hasStockIssues: boolean;
}

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cart-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  private router = inject(Router);

  readonly arrowLeftIcon = ArrowLeft;
  readonly trashIcon = Trash;
  readonly arrowRightIcon = ArrowRight;
  readonly lockIcon = Lock;
  readonly xIcon = X;
  readonly infoIcon = Info;
  readonly shieldCheckIcon = Shield;
  readonly packageIcon = Package;

  // Data de ejemplo (mock)
  mockCartItems: CartItem[] = [
    {
      variantId: 'var-001',
      productName: 'Camiseta Básica',
      variantName: 'Talla M',
      sku: 'TSHIRT-M-BLK',
      attributes: { talla: 'M', color: 'Negro' },
      imageUrl: 'https://picsum.photos/seed/camiseta/300/300',
      unitPriceCop: 45000,
      quantity: 2,
      inventory: { onHand: 12, reserved: 3 },
    },
    {
      variantId: 'var-002',
      productName: 'Pantalón Cargo',
      variantName: 'Talla 32',
      sku: 'PANT-32-OLV',
      attributes: { talla: '32', color: 'Oliva' },
      imageUrl: 'https://picsum.photos/seed/pantalon/300/300',
      unitPriceCop: 89000,
      quantity: 1,
      inventory: { onHand: 4, reserved: 1 },
    },
    {
      variantId: 'var-003',
      productName: 'Chaqueta Impermeable',
      variantName: 'Talla L',
      sku: 'JKT-L-GRY',
      attributes: { talla: 'L', color: 'Gris' },
      imageUrl: 'https://picsum.photos/seed/chaqueta/300/300',
      unitPriceCop: null, // sin precio
      quantity: 1,
      inventory: { onHand: 6, reserved: 2 },
    },
  ];

  mockCartSummary: CartSummary = {
    subtotal: 179000,
    shipping: 0,
    discount: 0,
    total: 179000,
    hasPriceIssues: true, // porque hay un item con unitPriceCop = null
    hasStockIssues: false,
  };

  // Métodos de ejemplo (solo para que el HTML no falle si los conectas)
  onIncreaseQuantity(item: CartItem): void {
    item.quantity++;
  }

  onDecreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  onRemoveItem(item: CartItem): void {
    this.mockCartItems = this.mockCartItems.filter((i) => i.variantId !== item.variantId);
  }

  getAvailable(item: CartItem): number {
    return item.inventory.onHand - item.inventory.reserved;
  }

  getItemSubtotal(item: CartItem): number {
    if (!item.unitPriceCop) return 0;
    return item.unitPriceCop * item.quantity;
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/sales/catalog');
  }

  goToCheckout(): void {
    if (this.mockCartSummary.hasPriceIssues || this.mockCartSummary.hasStockIssues) {
      return;
    }
    this.router.navigateByUrl('/sales/checkout');
  }

  clearCart(): void {
    this.mockCartItems = [];
  }

  decreaseQty(item: any): void {
    this.mockCartItems.forEach((cartItem) => {
      if (cartItem.variantId === item.variantId && cartItem.quantity > 1) {
        cartItem.quantity--;
      }
    });
  }
  increaseQty(item: any): void {
    this.mockCartItems.forEach((cartItem) => {
      if (cartItem.variantId === item.variantId) {
        cartItem.quantity++;
      }
    });
  }

  removeItem(item: any): void {
    this.mockCartItems = this.mockCartItems.filter(
      (cartItem) => cartItem.variantId !== item.variantId
    );
  }
}
