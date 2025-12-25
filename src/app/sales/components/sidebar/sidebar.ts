import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ChevronDown, ChevronUp, Funnel, LucideAngularModule } from 'lucide-angular';
import { Product } from '../../interface';
import { FilterService } from '../../services/filter.service';

interface ExpandedSections {
  products: boolean;
}

@Component({
  selector: 'sales-sidebar',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private filterService = inject(FilterService);

  readonly products = input<Product[]>([]);

  // Icons
  readonly chevronDownIcon = ChevronDown;
  readonly chevronUpIcon = ChevronUp;
  readonly filterIcon = Funnel;

  // Section expansion state
  expandedSections = signal<ExpandedSections>({
    products: true,
  });

  readonly filters = this.filterService.filters;
  readonly sortedProducts = computed(() =>
    [...this.products()].sort((a, b) => a.name.localeCompare(b.name))
  );

  toggleSection(section: keyof ExpandedSections): void {
    this.expandedSections.update((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  isSectionExpanded(section: keyof ExpandedSections): boolean {
    return this.expandedSections()[section];
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
}
