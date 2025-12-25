import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Check, LucideAngularModule, Package, ShoppingCart } from 'lucide-angular';
import { ImageWithFallback } from '../../../shared/components/image-with-fallback/image-with-fallback';
import { ProductVariant } from '../../interface';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

@Component({
  selector: 'sales-product-card',
  imports: [CommonModule, LucideAngularModule, ImageWithFallback],
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly variant = input.required<ProductVariant>();

  private readonly cartService = inject(CartService);
  private readonly catalogService = inject(CatalogService);

  // Icons
  readonly cartIcon = ShoppingCart;
  readonly packageIcon = Package;
  readonly checkIcon = Check;

  readonly isAdded = signal(false);

  readonly priceUnavailable = computed(() => this.variant().unitPriceCop == null);
  readonly productName = computed(() => this.variant().product?.name ?? this.variant().name);
  readonly variantName = computed(() =>
    this.variant().product?.name ? this.variant().name : this.variant().sku
  );
  readonly attributesLabel = computed(() => this.formatAttributes(this.variant().attributesJson));
  readonly imageUrl = computed(() => {
    const variant = this.variant();
    const image = variant.images?.[0];
    if (image?.id) {
      return this.catalogService.buildVariantImageUrl(variant.id, image.id);
    }
    return PLACEHOLDER_IMAGE;
  });
  readonly imageAlt = computed(() => {
    const variant = this.variant();
    const image = variant.images?.[0];
    return image?.altText ?? this.productName();
  });
  readonly availability = computed(() => {
    const inventory = this.variant().inventory;
    if (!inventory) {
      return {
        label: 'Disponibilidad no informada',
        className: 'mt-3 text-xs text-slate-500 flex items-center gap-1',
        dotClass: 'w-2 h-2 bg-slate-400 rounded-full shrink-0',
      };
    }

    const availableUnits = inventory.onHand - inventory.reserved;
    if (availableUnits > 0) {
      return {
        label: 'Disponible en stock',
        className: 'mt-3 text-xs text-green-600 flex items-center gap-1',
        dotClass: 'w-2 h-2 bg-green-600 rounded-full shrink-0',
      };
    }

    return {
      label: 'Sin stock',
      className: 'mt-3 text-xs text-amber-600 flex items-center gap-1',
      dotClass: 'w-2 h-2 bg-amber-600 rounded-full shrink-0',
    };
  });
  readonly addButtonClass = computed(() => {
    const base =
      'px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shrink-0';
    if (this.priceUnavailable()) {
      return `${base} bg-slate-200 text-slate-500 cursor-not-allowed`;
    }
    if (this.isAdded()) {
      return `${base} bg-green-500 text-white cursor-pointer`;
    }
    return `${base} bg-blue-600 hover:bg-blue-700 text-white cursor-pointer`;
  });

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  }

  addToCart(): void {
    if (this.priceUnavailable()) {
      return;
    }

    const variant = this.variant();
    const unitPrice = variant.unitPriceCop ?? 0;
    this.cartService.addItem({
      id: variant.id,
      name: variant.product?.name ?? variant.name,
      presentation: variant.product?.name ? variant.name : variant.sku,
      unitPrice,
      image: this.imageUrl(),
    });

    this.isAdded.set(true);
    setTimeout(() => this.isAdded.set(false), 2000);
  }

  private formatAttributes(attributes: ProductVariant['attributesJson']): string {
    if (!attributes) {
      return '';
    }

    const entries = Object.entries(attributes).filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    );
    if (!entries.length) {
      return '';
    }

    return entries
      .map(([key, value]) => `${this.formatAttributeKey(key)}: ${String(value)}`)
      .join(', ');
  }

  private formatAttributeKey(key: string): string {
    if (!key) {
      return '';
    }
    return `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  }
}
