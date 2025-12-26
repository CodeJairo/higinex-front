import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'admin-navbar',
  imports: [RouterLinkActive, RouterLink],
  templateUrl: './admin-navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNavbar {
  readonly isVisible = signal(true);
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

    if (currentScrollY < this.lastScrollY) {
      this.isVisible.set(true);
    } else if (currentScrollY > this.lastScrollY && currentScrollY > 80) {
      this.isVisible.set(false);
    }

    this.lastScrollY = currentScrollY;
  }
}
