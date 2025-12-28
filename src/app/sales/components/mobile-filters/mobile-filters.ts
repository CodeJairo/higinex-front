import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ChevronDown, ChevronUp, LucideAngularModule, X } from 'lucide-angular';
import { Product } from '../../interfaces';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'sales-mobile-filters',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './mobile-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilters {
  readonly closeFilters = output<void>();

  private filterService = inject(FilterService);

  readonly products = input<Product[]>([]);

  // Icons
  readonly chevronDownIcon = ChevronDown;
  readonly chevronUpIcon = ChevronUp;
  readonly xIcon = X;

  // Section expansion state
  expandedSections = signal({
    products: true,
  });

  readonly filters = this.filterService.filters;
  readonly sortedProducts = computed(() =>
    [...this.products()].sort((a, b) => a.name.localeCompare(b.name))
  );

  toggleSection(section: string): void {
    this.expandedSections.update((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections()[section as keyof ReturnType<typeof this.expandedSections>];
  }

  toggleProduct(productId: string): void {
    this.filterService.toggleProduct(productId);
  }

  isProductSelected(productId: string): boolean {
    return this.filters().productIds.includes(productId);
  }

  clearFilters(): void {
    this.filterService.resetFilters();
  }

  close(): void {
    this.closeFilters.emit();
  }
}
