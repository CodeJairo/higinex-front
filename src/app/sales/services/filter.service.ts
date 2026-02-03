import { Injectable, signal } from '@angular/core';
import { FilterState, ProductVariant, SortOption } from '../interfaces';

const DEFAULT_FILTERS: FilterState = {
  productIds: [],
  sortBy: 'relevance',
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

  updateSortOption(sortBy: SortOption): void {
    this.filtersSignal.update((filters) => ({ ...filters, sortBy }));
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

    let result = variants.filter((variant) => {
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

    // Apply sorting
    result = this.sortVariants(result, filters.sortBy);

    return result;
  }

  private sortVariants(variants: ProductVariant[], sortBy: SortOption): ProductVariant[] {
    const sorted = [...variants];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => (a.unitPriceCop ?? Infinity) - (b.unitPriceCop ?? Infinity));
      case 'price_desc':
        return sorted.sort((a, b) => (b.unitPriceCop ?? 0) - (a.unitPriceCop ?? 0));
      case 'name_asc':
        return sorted.sort((a, b) => {
          const nameA = (a.product?.name ?? a.name).toLowerCase();
          const nameB = (b.product?.name ?? b.name).toLowerCase();
          return nameA.localeCompare(nameB, 'es');
        });
      case 'relevance':
      default:
        return sorted;
    }
  }
}
