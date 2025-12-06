import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChevronDown, ChevronUp, Funnel, LucideAngularModule } from 'lucide-angular';
import { FilterService } from '../../services/filter.service';

interface ExpandedSections {
  categories: boolean;
  price: boolean;
  presentation: boolean;
  availability: boolean;
  brands: boolean;
}

@Component({
  selector: 'sales-sidebar',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private filterService = inject(FilterService);

  // Icons
  readonly chevronDownIcon = ChevronDown;
  readonly chevronUpIcon = ChevronUp;
  readonly filterIcon = Funnel;

  // Section expansion state
  expandedSections = signal<ExpandedSections>({
    categories: true,
    price: true,
    presentation: true,
    availability: true,
    brands: true,
  });

  readonly categories = [
    { id: 'dental', label: 'Cuidado Dental', count: 24 },
    { id: 'personal', label: 'Cuidado Personal', count: 45 },
    { id: 'soap', label: 'Jabones y Geles', count: 32 },
    { id: 'cleaning', label: 'Limpieza del Hogar', count: 28 },
    { id: 'sanitizer', label: 'Desinfectantes', count: 18 },
  ];

  readonly presentations = [
    { id: 'unit', label: 'Unidad' },
    { id: 'pack', label: 'Paquete (x6-12)' },
    { id: 'box', label: 'Caja (x24-72)' },
    { id: 'bulk', label: 'Bulto (x100+)' },
  ];

  readonly brands = [
    'Colgate',
    'Oral-B',
    'Dove',
    'Palmolive',
    'Protex',
    'Axion',
    'Fabuloso',
    'Lysol',
  ];

  readonly availabilityOptions = [
    { value: 'all', label: 'Todos los productos' },
    { value: 'in-stock', label: 'En stock' },
    { value: 'pre-order', label: 'Pre-orden' },
  ];

  readonly filters = this.filterService.filters;

  toggleSection(section: keyof ExpandedSections): void {
    this.expandedSections.update((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  isSectionExpanded(section: keyof ExpandedSections): boolean {
    return this.expandedSections()[section];
  }

  toggleCategory(categoryId: string): void {
    this.filterService.toggleCategory(categoryId);
  }

  isCategorySelected(categoryId: string): boolean {
    return this.filters().categories.includes(categoryId);
  }

  togglePresentation(presentationId: string): void {
    this.filterService.togglePresentation(presentationId);
  }

  isPresentationSelected(presentationId: string): boolean {
    return this.filters().presentations.includes(presentationId);
  }

  toggleBrand(brand: string): void {
    this.filterService.toggleBrand(brand);
  }

  isBrandSelected(brand: string): boolean {
    return this.filters().brands.includes(brand);
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
}
