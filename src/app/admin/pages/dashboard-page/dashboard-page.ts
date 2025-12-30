import { CommonModule } from '@angular/common'; // Keeping NgClass just in case, but CommonModule exports it.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import {
  AlertCircle,
  Calendar,
  CircleCheckBig,
  Clock,
  FileText,
  Heart,
  LucideAngularModule,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
  Truck,
  UserPlus,
  Warehouse
} from 'lucide-angular';
import { lastValueFrom } from 'rxjs';
import { Order, OrderStatus } from '../../interfaces/orders.interface';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'sales-dashboard-page',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private router = inject(Router);
  private ordersService = inject(OrdersService);

  // Icons
  readonly cartIcon = ShoppingCart;
  readonly packageIcon = Package;
  readonly refreshIcon = RefreshCw;
  readonly heartIcon = Heart;
  readonly trendingIcon = TrendingUp;
  readonly clockIcon = Clock;
  readonly calendarIcon = Calendar;
  readonly checkIcon = CircleCheckBig;
  readonly truckIcon = Truck;
  readonly sparklesIcon = Sparkles;
  readonly tagIcon = Tag;
  readonly userPlusIcon = UserPlus;
  readonly fileTextIcon = FileText;
  readonly warehouseIcon = Warehouse;
  readonly alertIcon = AlertCircle; // Added for canceled/returned

  // Stats (keeping mock for now as per request only mentioned orders)
  readonly stats = {
    ordersThisMonth: 12,
    totalSavings: 1250000,
    pendingOrders: 3,
    preparingOrders: 2,
    readyToShipOrders: 4,
  };

  readonly lowStockProducts: { id: string; name: string; stock: number }[] | null = [
    { id: 'PRD-2024-0987', name: 'Camiseta Deportiva Azul', stock: 5 },
    { id: 'PRD-2024-1023', name: 'Zapatillas Running Pro', stock: 2 },
  ];

  // Recent orders query
  recentOrdersQuery = injectQuery(() => ({
    queryKey: ['recent-orders'],
    queryFn: () => lastValueFrom(this.ordersService.getOrders({ limit: 3, offset: 0 })),
  }));

  get currentDate(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatPrice(price: string | number): string {
    const value = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  }

  getOrdersList(data: any): Order[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.data || [];
  }

  getOrderStatusInfo(status: string): { label: string; colorClass: string } {
    switch (status) {
      case OrderStatus.DELIVERED:
        return { label: 'Entregado', colorClass: 'text-success bg-success/10' };
      case OrderStatus.SHIPPED:
        return { label: 'Enviado', colorClass: 'text-info bg-info/10' };
      case OrderStatus.PREPARING:
        return { label: 'Preparando', colorClass: 'text-warning bg-warning/10' };
      case OrderStatus.PAID:
        return { label: 'Pagado', colorClass: 'text-success bg-success/10' };
      case OrderStatus.PENDING_PAYMENT:
        return { label: 'Pendiente de Pago', colorClass: 'text-warning bg-warning/10' };
      case OrderStatus.CANCELED:
        return { label: 'Cancelado', colorClass: 'text-error bg-error/10' };
      case OrderStatus.RETURNED:
        return { label: 'Devuelto', colorClass: 'text-error bg-error/10' };
      case OrderStatus.RETURN_REQUESTED:
        return { label: 'Devolución Solicitada', colorClass: 'text-warning bg-warning/10' };
      case OrderStatus.REFUNDED:
        return { label: 'Reembolsado', colorClass: 'text-error bg-error/10' };
      case OrderStatus.CREATED:
        return { label: 'Creado', colorClass: 'text-base-content/60 bg-base-200' };
      default:
        return { label: status, colorClass: 'text-base-content/60 bg-base-200' };
    }
  }

  getStatusIcon(status: string) {
    switch (status) {
      case OrderStatus.DELIVERED:
      case OrderStatus.PAID:
        return this.checkIcon;
      case OrderStatus.SHIPPED:
        return this.truckIcon;
      case OrderStatus.PREPARING:
      case OrderStatus.PENDING_PAYMENT:
        return this.clockIcon;
      case OrderStatus.CANCELED:
      case OrderStatus.RETURNED:
        return this.alertIcon;
      default:
        return this.packageIcon;
    }
  }

  navigateToInventory(): void {
    this.router.navigateByUrl('admin/inventory');
  }

  navigateToOrders(): void {
    this.router.navigateByUrl('admin/orders');
  }

  navigateToOrderDetail(id: string): void {
    this.router.navigate(['admin', 'orders', id]);
  }



  navigateToBilling(): void {
    this.router.navigateByUrl('admin/billing');
  }

  navigateToCatalog(): void {
    this.router.navigateByUrl('sales/catalog');
  }

  navigateToRegister(): void {
    this.router.navigateByUrl('admin/register');
  }
}
