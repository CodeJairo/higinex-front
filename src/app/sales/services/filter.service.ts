import { Injectable, signal } from '@angular/core';
import { FilterState, Product } from '../interface';

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  priceRange: [0, 1000000],
  presentations: [],
  availability: 'all',
  brands: [],
  hasDiscount: false,
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

  setDiscountFilter(hasDiscount: boolean): void {
    this.filtersSignal.update((filters) => ({
      ...filters,
      hasDiscount,
    }));
  }

  toggleCategory(categoryId: string): void {
    this.filtersSignal.update((filters) => {
      const newCategories = filters.categories.includes(categoryId)
        ? filters.categories.filter((c) => c !== categoryId)
        : [...filters.categories, categoryId];
      return { ...filters, categories: newCategories };
    });
  }

  togglePresentation(presentationId: string): void {
    this.filtersSignal.update((filters) => {
      const newPresentations = filters.presentations.includes(presentationId)
        ? filters.presentations.filter((p) => p !== presentationId)
        : [...filters.presentations, presentationId];
      return { ...filters, presentations: newPresentations };
    });
  }

  toggleBrand(brand: string): void {
    this.filtersSignal.update((filters) => {
      const newBrands = filters.brands.includes(brand)
        ? filters.brands.filter((b) => b !== brand)
        : [...filters.brands, brand];
      return { ...filters, brands: newBrands };
    });
  }

  setPriceRange(min: number, max: number): void {
    this.filtersSignal.update((filters) => ({
      ...filters,
      priceRange: [min, max],
    }));
  }

  setAvailability(availability: 'all' | 'in-stock' | 'pre-order'): void {
    this.filtersSignal.update((filters) => ({
      ...filters,
      availability,
    }));
  }

  filterProducts(products: Product[]): Product[] {
    const filters = this.filtersSignal();
    const searchQuery = this.searchQuerySignal().toLowerCase();

    return products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.brand.toLowerCase().includes(searchQuery) ||
          product.category.toLowerCase().includes(searchQuery);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) return false;
      }

      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Presentation filter
      if (filters.presentations.length > 0) {
        if (!filters.presentations.includes(product.presentationType)) return false;
      }

      // Availability filter
      if (filters.availability === 'in-stock' && !product.inStock) return false;
      if (filters.availability === 'pre-order' && product.inStock) return false;

      // Brand filter
      if (filters.brands.length > 0) {
        if (!filters.brands.includes(product.brand)) return false;
      }

      // Discount filter
      if (filters.hasDiscount && !product.discount) {
        return false;
      }

      return true;
    });
  }
}
