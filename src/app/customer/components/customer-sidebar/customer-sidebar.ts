import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ArrowRight,
  Bell,
  Heart,
  LucideAngularModule,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  User,
} from 'lucide-angular';

interface customerNavItem {
  label: string;
  route: string;
  icon: any;
  description?: string;
  disabled?: boolean; // Added disabled property
}

@Component({
  selector: 'customer-sidebar',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './customer-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerSidebar {
  readonly userIcon = User;
  readonly mapPinIcon = MapPin;
  readonly settingsIcon = Settings;
  readonly packageIcon = Package;
  readonly bellIcon = Bell;
  readonly heartIcon = Heart;
  readonly shoppingBagIcon = ShoppingBag;
  readonly arrowRightIcon = ArrowRight;

  navItems: customerNavItem[] = [
    {
      label: 'Mi perfil',
      route: '/customer/profile',
      icon: User,
      description: 'Nombre, documento y datos de contacto',
    },
    {
      label: 'Mis direcciones',
      route: '/customer/addresses',
      icon: MapPin,
      description: 'Lugares donde recibes tus pedidos',
    },
    {
      label: 'Mis pedidos',
      route: '/customer/orders',
      icon: Package,
      description: 'Historial y estado de pedidos',
    },
    {
      label: 'Favoritos',
      route: '/customer/favorites',
      icon: Heart,
      description: 'Productos que te gustan',
      disabled: true, // Favorites disabled
    },
    {
      label: 'Notificaciones',
      route: '/customer/notifications',
      icon: Bell,
      description: 'Alertas y preferencias',
      disabled: true, // Notifications disabled
    },
    {
      label: 'Apariencia',
      route: '/customer/appearance',
      icon: Settings,
      description: 'Tema claro/oscuro y estilo',
    },
  ];
}
