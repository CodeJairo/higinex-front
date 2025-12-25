import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  CircleCheckBig,
  Clock,
  Heart,
  LucideAngularModule,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp,
  Truck,
} from 'lucide-angular';
import { ImageWithFallback } from '../../../shared/components/image-with-fallback/image-with-fallback';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'sales-dashboard-page',
  imports: [LucideAngularModule, ImageWithFallback, CommonModule],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private router = inject(Router);
  private filterService = inject(FilterService);

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

  // Stats
  readonly stats = {
    ordersThisMonth: 12,
    totalSavings: 1250000,
  };

  // Recent orders
  readonly recentOrders: any[] = [
    { id: 'ORD-2024-1247', date: '28 Nov 2024', total: 685000, items: 45, status: 'delivered' },
    { id: 'ORD-2024-1246', date: '25 Nov 2024', total: 920000, items: 68, status: 'in-transit' },
    { id: 'ORD-2024-1245', date: '22 Nov 2024', total: 1250000, items: 102, status: 'delivered' },
    { id: 'ORD-2024-1244', date: '18 Nov 2024', total: 560000, items: 38, status: 'processing' },
  ];

  // Top products
  readonly topProducts = [
    {
      id: '1',
      name: 'Pasta Dental Triple Acción',
      presentation: 'Caja x 72 unidades',
      totalOrdered: 288,
      image:
        'https://images.unsplash.com/photo-1755086598087-771fc08e1ae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b290aHBhc3RlJTIwZGVudGFsJTIwY2FyZXxlbnwxfHx8fDE3NjQ3MDIwMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '2',
      name: 'Jabón de Tocador Original',
      presentation: 'Caja x 48 unidades',
      totalOrdered: 192,
      image:
        'https://images.unsplash.com/photo-1695986671511-0c3662685321?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2FwJTIwYmFyJTIwY2xlYW5pbmd8ZW58MXx8fHwxNzY0NzkwOTk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '3',
      name: 'Gel Antibacterial',
      presentation: 'Bulto x 100 unidades',
      totalOrdered: 150,
      image:
        'https://images.unsplash.com/photo-1695624825876-7110a459a21a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kJTIwc2FuaXRpemVyJTIwYm90dGxlfGVufDF8fHx8MTc2NDY5MDkxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  // New products
  readonly newProducts = [
    {
      id: '10',
      name: 'Desinfectante Multiusos Premium',
      presentation: 'Caja x 24 unidades',
      price: 285000,
      image:
        'https://images.unsplash.com/photo-1563201515-4e6f64c0b494?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNwcmF5JTIwYm90dGxlfGVufDF8fHx8MTczMzQzMDkwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '11',
      name: 'Shampoo Revitalizante',
      presentation: 'Caja x 36 unidades',
      price: 420000,
      image:
        'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGFtcG9vJTIwYm90dGxlJTIwcHJvZHVjdHxlbnwxfHx8fDE3MzM0MzA5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '12',
      name: 'Papel Higiénico Ultra Suave',
      presentation: 'Bulto x 48 rollos',
      price: 156000,
      image:
        'https://images.unsplash.com/photo-1585825060904-8b63ffe6ffdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2lsZXQlMjBwYXBlciUyMHJvbGx8ZW58MXx8fHwxNzMzNDMwOTQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  // Promotions
  readonly promotions = [
    {
      id: '1',
      title: 'Combo de Limpieza',
      description: '15% de descuento en compras mayores a 50 unidades',
      discount: '15%',
      colorClass: 'from-blue-500 to-blue-600',
    },
    {
      id: '2',
      title: 'Productos de Cuidado Personal',
      description: '2x1 en segundas unidades de pastas dentales',
      discount: '2x1',
      colorClass: 'from-green-500 to-green-600',
    },
  ];

  // Pre-order products
  readonly preOrderProducts = [
    {
      id: '20',
      name: 'Limpiador de Pisos Aromático',
      presentation: 'Caja x 12 galones',
      availableDate: '15 Dic 2024',
      image:
        'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9vciUyMGNsZWFuZXIlMjBib3R0bGV8ZW58MXx8fHwxNzMzNDMwOTYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '21',
      name: 'Toallas Húmedas Antibacteriales',
      presentation: 'Bulto x 96 paquetes',
      availableDate: '20 Dic 2024',
      image:
        'https://images.unsplash.com/photo-1631730486572-226d1f595b68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZXQlMjB3aXBlcyUyMHBhY2thZ2V8ZW58MXx8fHwxNzMzNDMwOTc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
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

  navigateToCatalog(): void {
    this.router.navigateByUrl('sales/catalog');
  }

  navigateToPromotions(): void {
    this.filterService.resetFilters();
    this.router.navigateByUrl('sales/catalog');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }
}
