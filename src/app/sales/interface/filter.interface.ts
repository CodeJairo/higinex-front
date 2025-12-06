export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  presentations: string[];
  availability: 'all' | 'in-stock' | 'pre-order';
  brands: string[];
  hasDiscount: boolean;
}
