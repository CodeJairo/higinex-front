import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ChevronDown, Funnel, LucideAngularModule, Search, TriangleAlert, X } from 'lucide-angular';
import { AuthService } from '../../../auth/services/auth.service';
import { MobileFilters } from '../../components/mobile-filters/mobile-filters';
import { ProductCard } from '../../components/product-card/product-card';
import { Sidebar } from '../../components/sidebar/sidebar';
import { CatalogService } from '../../services/catalog.service';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'sales-catalog-page',
  imports: [CommonModule, LucideAngularModule, ProductCard, Sidebar, MobileFilters],
  templateUrl: './catalog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly catalogService = inject(CatalogService);
  private readonly filterService = inject(FilterService);
  private readonly authService = inject(AuthService);

  readonly filterIcon = Funnel;
  readonly chevronDownIcon = ChevronDown;
  readonly alertIcon = TriangleAlert;
  readonly searchIcon = Search;
  readonly xIcon = X;

  readonly showMobileFilters = signal(false);

  private readonly productsQuery = injectQuery(() => ({
    queryKey: ['catalog', 'products'],
    queryFn: () => this.catalogService.listProducts(),
    enabled: this.authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  }));

  private readonly variantsQuery = injectQuery(() => ({
    queryKey: ['catalog', 'variants'],
    queryFn: () => this.catalogService.listVariants(),
    enabled: this.authService.isAuthenticated(),
    staleTime: 2 * 60 * 1000,
  }));

  readonly products = computed(() => this.productsQuery.data() ?? []);
  readonly variants = computed(() => this.variantsQuery.data() ?? []);
  readonly filteredVariants = computed(() => this.filterService.filterVariants(this.variants()));
  readonly isLoading = computed(
    () => this.productsQuery.isLoading() || this.variantsQuery.isLoading(),
  );
  readonly hasError = computed(() => this.productsQuery.isError() || this.variantsQuery.isError());

  openMobileFilters(): void {
    this.showMobileFilters.set(true);
  }

  closeMobileFilters(): void {
    this.showMobileFilters.set(false);
  }

  resetFilters(): void {
    this.filterService.resetFilters();
  }

  retryLoad(): void {
    this.productsQuery.refetch();
    this.variantsQuery.refetch();
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value as 'relevance' | 'price_asc' | 'price_desc' | 'name_asc';
    this.filterService.updateSortOption(value);
  }
}
