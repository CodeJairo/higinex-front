import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { AuthService } from '../../../auth/services/auth.service';
import { CartService } from '../../services/cart.service';
import { FilterService } from '../../services/filter.service';
import { CartDropdown } from '../cart-dropdown/cart-dropdown';

@Component({
  selector: 'sales-navbar',
  imports: [CommonModule, FormsModule, LucideAngularModule, CartDropdown],
  templateUrl: './navbar.html',
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
  private lastScrollY = 0;
  private scrollHandler!: () => void;
  private clickHandler!: (event: MouseEvent) => void;

  // From services
  readonly totalItems = this.cartService.totalItems;
  readonly cartItems = this.cartService.items;
  readonly userName = this.authService.userName;
  readonly userEmail = this.authService.userEmail;

  constructor() {
    // Sync search query with filter service
    effect(() => {
      this.filterService.updateSearchQuery(this.searchQuery());
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
    this.router.navigateByUrl('/auth/login');
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
}
