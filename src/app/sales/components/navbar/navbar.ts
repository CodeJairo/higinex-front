import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Bell,
  ChevronDown,
  CircleQuestionMark,
  CircleUser,
  FileText,
  Heart,
  LogOut,
  LucideAngularModule,
  MapPin,
  Package,
  Search,
  Settings,
  ShoppingCart,
  User,
} from 'lucide-angular';
import { Role } from '../../../auth/interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { CartService } from '../../services/cart.service';
import { FilterService } from '../../services/filter.service';
import { AdminUserMenu } from '../admin-user-menu/admin-user-menu';
import { CartDropdown } from '../cart-dropdown/cart-dropdown';
import { CustomerUserMenu } from '../customer-user-menu/customer-user-menu';

@Component({
  selector: 'sales-navbar',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    CartDropdown,
    CustomerUserMenu,
    AdminUserMenu,
  ],
  templateUrl: './navbar.html',
  host: {
    class:
      'sticky top-0 z-50 bg-base-100 border-b border-slate-200 shadow-sm transition-transform duration-300',
    '[class.translate-y-0]': 'isVisible()',
    '[class.-translate-y-full]': '!isVisible()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit, OnDestroy {
  private router = inject(Router);
  private cartService = inject(CartService);
  private filterService = inject(FilterService);
  private authService = inject(AuthService);

  // Icons
  readonly searchIcon = Search;
  readonly cartIcon = ShoppingCart;
  readonly userIcon = User;
  readonly bellIcon = Bell;
  readonly logoutIcon = LogOut;
  readonly chevronDownIcon = ChevronDown;
  readonly userCircleIcon = CircleUser;
  readonly packageIcon = Package;
  readonly mapPinIcon = MapPin;
  readonly fileTextIcon = FileText;
  readonly heartIcon = Heart;
  readonly settingsIcon = Settings;
  readonly helpIcon = CircleQuestionMark;

  // State
  isVisible = signal(true);
  showUserMenu = signal(false);
  showCart = signal(false);
  searchQuery = signal('');
  isAdmin = computed(() => this.authService.user()?.role === Role.ADMIN);
  private lastScrollY = 0;
  private scrollHandler!: () => void;
  private clickHandler!: (event: MouseEvent) => void;

  // From services
  readonly totalItems = this.cartService.totalItems;
  readonly cartItems = this.cartService.items;
  readonly hasUser = computed(() => !!this.authService.user());
  readonly userDisplayName = computed(() => {
    const user = this.authService.user();
    if (!user) {
      return '';
    }
    if (user.role === Role.USER) {
      return this.capitalizeWords(user.customer?.name ?? '') || user.email || '';
    }
    return user.email ?? '';
  });
  readonly userDisplayDetail = computed(() => {
    const user = this.authService.user();
    if (!user) {
      return '';
    }
    if (user.role === Role.USER) {
      return user.customer?.name ? user.email ?? '' : '';
    }
    if (user.role === Role.ADMIN) {
      return 'ADMINISTRADOR';
    }
    return '';
  });

  constructor() {
    effect(() => {
      this.filterService.updateSearchQuery(this.searchQuery());
    });
    effect(() => {
      if (!this.authService.user()) {
        this.showUserMenu.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.scrollHandler = () => this.handleScroll();
    this.clickHandler = (event: MouseEvent) => this.handleClickOutside(event);

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    document.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    document.removeEventListener('click', this.clickHandler);
  }

  private handleScroll(): void {
    const currentScrollY = window.scrollY;

    if (window.innerWidth < 768) {
      if (currentScrollY < this.lastScrollY) {
        this.isVisible.set(true);
      } else if (currentScrollY > this.lastScrollY && currentScrollY > 80) {
        this.isVisible.set(false);
      }
    } else {
      this.isVisible.set(true);
    }

    this.lastScrollY = currentScrollY;
  }

  private handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu-button') && !target.closest('#user-menu-dropdown')) {
      this.showUserMenu.set(false);
    }
  }

  toggleUserMenu(): void {
    if (!this.hasUser()) {
      return;
    }
    this.showUserMenu.update((v) => !v);
  }

  toggleCart(): void {
    this.showCart.update((v) => !v);
  }

  closeCart(): void {
    this.showCart.set(false);
  }

  goToDashboard(): void {
    this.router.navigateByUrl('/sales/dashboard');
  }

  goToCatalog(): void {
    this.router.navigateByUrl('/sales/catalog');
  }

  logout(): void {
    this.showUserMenu.set(false);
    this.authService.logout();
    window.location.reload();
  }

  updateQuantity(id: string, quantity: number): void {
    this.cartService.updateQuantity(id, quantity);
  }

  removeItem(id: string): void {
    this.cartService.removeItem(id);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  private capitalizeWords(value: string): string {
    return value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
      .join(' ');
  }
}
