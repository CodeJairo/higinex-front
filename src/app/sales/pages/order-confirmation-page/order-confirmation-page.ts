import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CircleCheckBig, Clock, LucideAngularModule, Phone, X } from 'lucide-angular';

interface OrderConfirmationItem {
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface OrderConfirmationTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
}

interface OrderConfirmation {
  id: string;
  orderNumber: string;
  status: string;
  reservationExpiresAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  totals: OrderConfirmationTotals;
  items: OrderConfirmationItem[];
}

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './order-confirmation-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationPage {
  private readonly router = inject(Router);

  readonly checkCircleIcon = CircleCheckBig;
  readonly clockIcon = Clock;
  readonly xIcon = X;
  readonly phoneIcon = Phone;

  mockOrderConfirmation: OrderConfirmation = {
    id: 'order-001',
    orderNumber: 'ORD-9B1C2D3E4F5A',
    status: 'PENDING_PAYMENT',
    reservationExpiresAt: '2025-01-05T12:30:00.000Z',
    customer: {
      name: 'María Gómez',
      email: 'maria@empresa.com',
      phone: '3001234567',
    },
    totals: {
      subtotal: 179000,
      shipping: 0,
      discount: 0,
      total: 179000,
      currency: 'COP',
    },
    items: [
      {
        productName: 'Camiseta Básica',
        variantName: 'Talla M',
        sku: 'TSHIRT-M-BLK',
        unitPrice: 45000,
        quantity: 2,
        lineTotal: 90000,
      },
      {
        productName: 'Pantalón Cargo',
        variantName: 'Talla 32',
        sku: 'PANT-32-OLV',
        unitPrice: 89000,
        quantity: 1,
        lineTotal: 89000,
      },
    ],
  };

  // Helpers de ejemplo si los quieres usar después
  onGoToCatalog(): void {
    console.log('Volver al catálogo (mock)');
  }

  onCancelOrder(): void {
    console.log('Cancelar pedido (mock)');
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/sales/catalog');
  }
}
