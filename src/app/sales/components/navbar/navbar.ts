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
import { LucideAngularModule, Search, ShoppingCart } from 'lucide-angular';
import { Role } from '../../../auth/interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { CartService } from '../../services/cart.service';
import { FilterService } from '../../services/filter.service';
import { AdminUserMenu } from '../admin-user-menu/admin-user-menu';
import { CartDropdown } from '../cart-dropdown/cart-dropdown';
import { CustomerUserMenu } from '../customer-user-menu/customer-user-menu';

@Component({
  selector: 'sales-navbar',
  imports: [FormsModule, LucideAngularModule, CartDropdown, CustomerUserMenu, AdminUserMenu],
  templateUrl: './navbar.html',
  host: {
    class: 'block',
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

  // State
  isVisible = signal(true);
  hasScrolled = signal(false);
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
    // Usamos bind para no perder el contexto 'this'
    this.scrollHandler = this.handleScroll.bind(this);

    // { passive: true } mejora el rendimiento del scroll
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    document.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    document.removeEventListener('click', this.clickHandler);
  }

  private handleScroll(): void {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop;

    // Lógica para sombra: Si bajamos más de 10px, activamos sombra
    this.hasScrolled.set(currentScrollY > 10);

    // Lógica para ocultar/mostrar (Solo Mobile < 1024px o como prefieras)
    if (window.innerWidth < 1024) {
      // 1. Siempre mostrar si estamos muy cerca del top (evita rebote en iOS)
      if (currentScrollY <= 20) {
        this.isVisible.set(true);
        this.lastScrollY = currentScrollY;
        return;
      }

      // 2. Determinar dirección
      // Si el scroll actual es mayor al anterior => Bajando => Ocultar
      if (currentScrollY > this.lastScrollY) {
        this.isVisible.set(false);
      } else {
        // Si el scroll actual es menor => Subiendo => Mostrar
        this.isVisible.set(true);
      }
    } else {
      // En Desktop siempre visible
      this.isVisible.set(true);
    }

    this.lastScrollY = currentScrollY;
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

  goToCatalog(): void {
    this.router.navigateByUrl('/sales/catalog');
  }

  logout(): void {
    this.showUserMenu.set(false);
    this.authService.logout();
    window.location.reload();
  }

  updateQuantity(variantId: string, quantity: number): void {
    this.cartService.updateQuantity(variantId, quantity);
  }

  removeItem(variantId: string): void {
    this.cartService.removeItem(variantId);
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
