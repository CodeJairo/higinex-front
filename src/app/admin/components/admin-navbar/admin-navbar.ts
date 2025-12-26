import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'admin-navbar',
  imports: [RouterLinkActive, RouterLink],
  templateUrl: './admin-navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNavbar {
  private router = inject(Router);

  isVisible = signal(true);
  private lastScrollY = 0;
  private scrollHandler!: () => void;

  ngOnInit(): void {
    this.scrollHandler = () => this.handleScroll();

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
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
}
