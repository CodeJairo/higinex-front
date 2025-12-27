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
import { Router } from '@angular/router';
import {
  Bell,
  ChevronDown,
  CircleQuestionMark,
  CircleUser,
  LucideAngularModule,
  Settings,
  User,
} from 'lucide-angular';
import { Role } from '../../../auth/interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { AdminUserMenu } from '../../../sales/components/admin-user-menu/admin-user-menu';
import { CustomerUserMenu } from '../../../sales/components/customer-user-menu/customer-user-menu';

@Component({
  selector: 'customer-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CustomerUserMenu, AdminUserMenu],
  templateUrl: './customer-navbar.html',
  host: {
    class:
      'sticky top-0 z-40 bg-base-100 border-b border-slate-200 shadow-sm transition-transform duration-300',
    '[class.translate-y-0]': 'isVisible()',
    '[class.-translate-y-full]': '!isVisible()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerNavbar implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Icons
  readonly userIcon = User;
  readonly bellIcon = Bell;
  readonly settingsIcon = Settings;
  readonly helpIcon = CircleQuestionMark;
  readonly chevronDownIcon = ChevronDown;
  readonly userCircleIcon = CircleUser;

  // State
  isVisible = signal(true);
  showUserMenu = signal(false);
  private lastScrollY = 0;
  private scrollHandler!: () => void;
  private clickHandler!: (event: MouseEvent) => void;

  readonly hasUser = computed(() => !!this.authService.user());
  readonly isAdmin = computed(() => this.authService.user()?.role === Role.ADMIN);

  readonly userDisplayName = computed(() => {
    const user = this.authService.user();
    if (!user) return '';
    if (user.role === Role.USER) {
      return this.capitalizeWords(user.customer?.name ?? '') || user.email || '';
    }
    return user.email ?? '';
  });

  readonly userDisplayDetail = computed(() => {
    const user = this.authService.user();
    if (!user) return '';
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
    if (
      !target.closest('#account-user-menu-button') &&
      !target.closest('#account-user-menu-dropdown')
    ) {
      this.showUserMenu.set(false);
    }
  }

  toggleUserMenu(): void {
    if (!this.hasUser()) return;
    this.showUserMenu.update((v) => !v);
  }

  goToHome(): void {
    this.router.navigateByUrl('/sales/catalog');
  }

  goToHelp(): void {
    // más adelante puedes llevar a /help o similar
    this.router.navigateByUrl('/help');
  }

  goToSettings(): void {
    this.router.navigateByUrl('/account/settings');
  }

  logout(): void {
    this.showUserMenu.set(false);
    this.authService.logout();
    window.location.reload();
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
