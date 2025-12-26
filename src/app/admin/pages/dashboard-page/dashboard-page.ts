import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
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
  Warehouse,
} from 'lucide-angular';

@Component({
  selector: 'sales-dashboard-page',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private router = inject(Router);

  // Icons
  readonly cartIcon = ShoppingCart;
  readonly packageIcon = Package;
  readonly refreshIcon = RefreshCw;
  readonly heartIcon = Heart;
  readonly trendingIcon = TrendingUp;
  readonly clockIcon = Clock;
  readonly checkIcon = CircleCheckBig;
  readonly truckIcon = Truck;
  readonly sparklesIcon = Sparkles;
  readonly tagIcon = Tag;
  readonly userPlusIcon = UserPlus;
  readonly fileTextIcon = FileText;
  readonly warehouseIcon = Warehouse;

  // Stats
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

  // Recent orders
  readonly recentOrders: any[] = [
    { id: 'ORD-2024-1247', date: '28 Nov 2024', total: 685000, items: 45, status: 'delivered' },
    { id: 'ORD-2024-1246', date: '25 Nov 2024', total: 920000, items: 68, status: 'in-transit' },
    { id: 'ORD-2024-1244', date: '18 Nov 2024', total: 560000, items: 38, status: 'processing' },
  ];

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  getOrderStatusInfo(status: string): { label: string; colorClass: string } {
    switch (status) {
      case 'delivered':
        return { label: 'Entregado', colorClass: 'text-green-600 bg-green-50' };
      case 'in-transit':
        return { label: 'En camino', colorClass: 'text-blue-600 bg-blue-50' };
      case 'processing':
        return { label: 'Procesando', colorClass: 'text-amber-600 bg-amber-50' };
      default:
        return { label: 'Desconocido', colorClass: 'text-slate-600 bg-slate-50' };
    }
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'delivered':
        return this.checkIcon;
      case 'in-transit':
        return this.truckIcon;
      case 'processing':
        return this.clockIcon;
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
