import { Injectable, signal } from '@angular/core';
import { FilterState, ProductVariant } from '../interfaces';

const DEFAULT_FILTERS: FilterState = {
  productIds: [],
};

@Injectable({ providedIn: 'root' })
export class FilterService {
  private filtersSignal = signal<FilterState>(DEFAULT_FILTERS);
  private searchQuerySignal = signal<string>('');

  readonly filters = this.filtersSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();

  updateFilters(filters: FilterState): void {
    this.filtersSignal.set(filters);
  }

  updateSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  resetFilters(): void {
    this.filtersSignal.set(DEFAULT_FILTERS);
    this.searchQuerySignal.set('');
  }

  toggleProduct(productId: string): void {
    this.filtersSignal.update((filters) => {
      const nextIds = filters.productIds.includes(productId)
        ? filters.productIds.filter((id) => id !== productId)
        : [...filters.productIds, productId];
      return { ...filters, productIds: nextIds };
    });
  }

  filterVariants(variants: ProductVariant[]): ProductVariant[] {
    const filters = this.filtersSignal();
    const searchQuery = this.searchQuerySignal().toLowerCase();

    return variants.filter((variant) => {
      if (filters.productIds.length > 0 && !filters.productIds.includes(variant.productId)) {
        return false;
      }

      if (searchQuery) {
        const attributes = Object.values(variant.attributesJson ?? {})
          .map((value) => String(value))
          .join(' ');
        const matchesSearch = [
          variant.name,
          variant.sku,
          variant.gtin,
          variant.product?.name ?? '',
          attributes,
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery);

        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }
}
