export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'name_asc';

export interface FilterState {
  productIds: string[];
  sortBy: SortOption;
}
