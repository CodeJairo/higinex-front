import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChevronDown, ChevronUp, LucideAngularModule, X } from 'lucide-angular';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'sales-mobile-filters',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './mobile-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilters {
  @Output() closeFilters = new EventEmitter<void>();

  private filterService = inject(FilterService);

  // Icons
  readonly chevronDownIcon = ChevronDown;
  readonly chevronUpIcon = ChevronUp;
  readonly xIcon = X;

  // Section expansion state
  expandedSections = signal({
    categories: true,
    price: false,
    presentation: false,
    availability: false,
    brands: false,
  });

  readonly categories = [
    { id: 'dental', label: 'Cuidado Dental', count: 24 },
    { id: 'personal', label: 'Cuidado Personal', count: 45 },
    { id: 'soap', label: 'Jabones y Geles', count: 32 },
    { id: 'cleaning', label: 'Limpieza del Hogar', count: 28 },
    { id: 'sanitizer', label: 'Desinfectantes', count: 18 },
  ];

  readonly availabilityOptions = [
    { value: 'all', label: 'Todos los productos' },
    { value: 'in-stock', label: 'En stock' },
    { value: 'pre-order', label: 'Pre-orden' },
  ];

  readonly filters = this.filterService.filters;

  toggleSection(section: string): void {
    this.expandedSections.update((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections()[section as keyof ReturnType<typeof this.expandedSections>];
  }

  toggleCategory(categoryId: string): void {
    this.filterService.toggleCategory(categoryId);
  }

  isCategorySelected(categoryId: string): boolean {
    return this.filters().categories.includes(categoryId);
  }

  setAvailability(availability: 'all' | 'in-stock' | 'pre-order'): void {
    this.filterService.setAvailability(availability);
  }

  setPriceMin(value: string): void {
    const num = Number(value) || 0;
    this.filterService.setPriceRange(num, this.filters().priceRange[1]);
  }

  setPriceMax(value: string): void {
    const num = Number(value) || 1000000;
    this.filterService.setPriceRange(this.filters().priceRange[0], num);
  }

  setHasDiscount(value: boolean): void {
    this.filterService.setDiscountFilter(value);
  }

  clearFilters(): void {
    this.filterService.resetFilters();
  }

  close(): void {
    this.closeFilters.emit();
  }
}
