import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  CircleAlert,
  Info,
  LucideAngularModule,
  Map,
  NotebookPen,
  Shield,
  Truck,
  User,
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

interface CheckoutCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

interface CheckoutAddress {
  id: string;
  label: string;
  line1: string;
  line2: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
}

interface CheckoutSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './checkout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly router = inject(Router);

  readonly alertIcon = CircleAlert;
  readonly userIcon = User;
  readonly mapIcon = Map;
  readonly infoIcon = Info;
  readonly noteIcon = NotebookPen;
  readonly shieldIcon = Shield;
  readonly truckIcon = Truck;
  readonly arrowLeftIcon = ArrowLeft;
  // Items de ejemplo (puedes reutilizar los del carrito)
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
  ];

  mockCheckoutCustomer: CheckoutCustomer = {
    id: 'cust-001',
    name: 'María Gómez',
    email: 'maria@empresa.com',
    phone: '3001234567',
    documentType: 'CC',
    documentNumber: '10203040',
  };

  mockCheckoutAddress: CheckoutAddress = {
    id: 'addr-001',
    label: 'Oficina principal',
    line1: 'Cra 10 #20-30',
    line2: 'Oficina 502',
    neighborhood: 'Centro',
    city: 'Bogotá',
    state: 'Cundinamarca',
    postalCode: '110111',
    notes: 'Entregar en recepción',
  };

  mockCheckoutNotes: string = 'Entregar después de las 3pm.';

  mockCheckoutSummary: CheckoutSummary = {
    subtotal: 179000,
    shipping: 0,
    discount: 0,
    total: 179000,
  };

  // Flags de validación
  get hasPriceIssues(): boolean {
    return this.mockCartItems.some((item) => item.unitPriceCop == null);
  }

  get hasStockIssues(): boolean {
    return this.mockCartItems.some((item) => this.getAvailable(item) <= 0);
  }

  getAvailable(item: CartItem): number {
    return item.inventory.onHand - item.inventory.reserved;
  }

  getItemLineTotal(item: CartItem): number {
    if (!item.unitPriceCop) return 0;
    return item.unitPriceCop * item.quantity;
  }

  onConfirmOrder(): void {
    if (this.hasPriceIssues || this.hasStockIssues) {
      return;
    }
    this.router.navigateByUrl('/sales/order-confirmation');
  }
}
