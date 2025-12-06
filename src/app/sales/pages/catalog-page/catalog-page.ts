import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Funnel, LucideAngularModule } from 'lucide-angular';
import { MobileFilters } from '../../components/mobile-filters/mobile-filters';
import { ProductCard } from '../../components/product-card/product-card';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Product } from '../../interface';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'sales-catalog-page',
  imports: [CommonModule, LucideAngularModule, ProductCard, Sidebar, MobileFilters],
  templateUrl: './catalog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private filterService = inject(FilterService);

  readonly filterIcon = Funnel;

  showMobileFilters = signal(false);

  // Mock products data
  readonly allProducts: Product[] = [
    {
      id: '1',
      name: 'Pasta Dental Triple Acción',
      description: 'Protección completa con fluoruro activo para combatir caries',
      category: 'dental',
      brand: 'Higinex',
      presentation: 'Caja x 72 unidades',
      presentationType: 'box',
      unitSize: '150 ml',
      price: 285000,
      image:
        'https://images.unsplash.com/photo-1755086598087-771fc08e1ae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b290aHBhc3RlJTIwZGVudGFsJTIwY2FyZXxlbnwxfHx8fDE3NjQ3MDIwMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
      discount: 20,
    },
    {
      id: '2',
      name: 'Jabón de Tocador Original',
      description: 'Hidratación profunda con ¼ de crema hidratante',
      category: 'soap',
      brand: 'Higinex',
      presentation: 'Caja x 48 unidades',
      presentationType: 'box',
      unitSize: '90 g',
      price: 156000,
      image:
        'https://images.unsplash.com/photo-1695986671511-0c3662685321?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2FwJTIwYmFyJTIwY2xlYW5pbmd8ZW58MXx8fHwxNzY0NzkwOTk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
      discount: 15,
    },
    {
      id: '3',
      name: 'Cepillo Dental Pro-Salud',
      description: 'Cerdas suaves que cuidan las encías y remueven placa',
      category: 'dental',
      brand: 'Higinex',
      presentation: 'Paquete x 12 unidades',
      presentationType: 'pack',
      unitSize: 'Medio',
      price: 45000,
      image:
        'https://images.unsplash.com/photo-1595514535431-1243b02c3b70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b290aGJydXNoJTIwYmF0aHJvb218ZW58MXx8fHwxNzY0NzkwOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
    },
    {
      id: '4',
      name: 'Shampoo Naturals',
      description: 'Limpieza suave con extractos naturales para todo tipo de cabello',
      category: 'personal',
      brand: 'Higinex',
      presentation: 'Caja x 24 unidades',
      presentationType: 'box',
      unitSize: '350 ml',
      price: 198000,
      image:
        'https://images.unsplash.com/photo-1660090455967-24cf8b0eb58d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGFtcG9vJTIwYm90dGxlfGVufDF8fHx8MTc2NDY4NTQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
      discount: 20,
    },
    {
      id: '5',
      name: 'Desinfectante Multiusos',
      description: 'Elimina 99.9% de gérmenes y bacterias en superficies',
      category: 'cleaning',
      brand: 'Higinex',
      presentation: 'Caja x 12 unidades',
      presentationType: 'box',
      unitSize: '500 ml',
      price: 124000,
      image:
        'https://images.unsplash.com/photo-1645724466032-00b9c456e4b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHByb2R1Y3RzJTIwc3ByYXl8ZW58MXx8fHwxNzY0NzkwOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
    },
    {
      id: '6',
      name: 'Gel Antibacterial',
      description: 'Protección instantánea sin agua con 70% alcohol',
      category: 'sanitizer',
      brand: 'Higinex',
      presentation: 'Bulto x 100 unidades',
      presentationType: 'bulk',
      unitSize: '60 ml',
      price: 425000,
      image:
        'https://images.unsplash.com/photo-1695624825876-7110a459a21a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kJTIwc2FuaXRpemVyJTIwYm90dGxlfGVufDF8fHx8MTc2NDY5MDkxNnww&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
      discount: 15,
    },
    {
      id: '7',
      name: 'Jabón Líquido Antibacterial',
      description: 'Fórmula que elimina bacterias mientras cuida tu piel',
      category: 'soap',
      brand: 'Higinex',
      presentation: 'Caja x 36 unidades',
      presentationType: 'box',
      unitSize: '250 ml',
      price: 176000,
      image:
        'https://images.unsplash.com/photo-1695986671511-0c3662685321?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2FwJTIwYmFyJTIwY2xlYW5pbmd8ZW58MXx8fHwxNzY0NzkwOTk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
    },
    {
      id: '8',
      name: 'Enjuague Bucal',
      description: 'Protección 24 horas contra bacterias y mal aliento',
      category: 'dental',
      brand: 'Higinex',
      presentation: 'Caja x 24 unidades',
      presentationType: 'box',
      unitSize: '500 ml',
      price: 212000,
      image:
        'https://images.unsplash.com/photo-1755086598087-771fc08e1ae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b290aHBhc3RlJTIwZGVudGFsJTIwY2FyZXxlbnwxfHx8fDE3NjQ3MDIwMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: false,
      discount: 20,
    },
    {
      id: '9',
      name: 'Limpiador Lavanda',
      description: 'Limpieza profunda con aroma fresco y duradero',
      category: 'cleaning',
      brand: 'Higinex',
      presentation: 'Bulto x 120 unidades',
      presentationType: 'bulk',
      unitSize: '1000 ml',
      price: 680000,
      image:
        'https://images.unsplash.com/photo-1645724466032-00b9c456e4b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHByb2R1Y3RzJTIwc3ByYXl8ZW58MXx8fHwxNzY0NzkwOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
    },
    {
      id: '10',
      name: 'Desodorante Men Care',
      description: 'Protección 48h contra el olor y cuidado de la piel',
      category: 'personal',
      brand: 'Higinex',
      presentation: 'Caja x 48 unidades',
      presentationType: 'box',
      unitSize: '150 ml',
      price: 234000,
      image:
        'https://images.unsplash.com/photo-1660090455967-24cf8b0eb58d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGFtcG9vJTIwYm90dGxlfGVufDF8fHx8MTc2NDY4NTQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
      discount: 15,
    },
    {
      id: '11',
      name: 'Jabón Avena',
      description: 'Protección antibacterial con extracto de avena natural',
      category: 'soap',
      brand: 'Higinex',
      presentation: 'Caja x 60 unidades',
      presentationType: 'box',
      unitSize: '110 g',
      price: 189000,
      image:
        'https://images.unsplash.com/photo-1695986671511-0c3662685321?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2FwJTIwYmFyJTIwY2xlYW5pbmd8ZW58MXx8fHwxNzY0NzkwOTk1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
    },
    {
      id: '12',
      name: 'Lavavajillas Limón',
      description: 'Poder desengrasante con aroma a limón natural',
      category: 'cleaning',
      brand: 'Higinex',
      presentation: 'Caja x 30 unidades',
      presentationType: 'box',
      unitSize: '750 ml',
      price: 145000,
      image:
        'https://images.unsplash.com/photo-1645724466032-00b9c456e4b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHByb2R1Y3RzJTIwc3ByYXl8ZW58MXx8fHwxNzY0NzkwOTk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      inStock: true,
      discount: 20,
    },
  ];

  readonly filteredProducts = computed(() => this.filterService.filterProducts(this.allProducts));

  openMobileFilters(): void {
    this.showMobileFilters.set(true);
  }

  closeMobileFilters(): void {
    this.showMobileFilters.set(false);
  }
}
