import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Check, Info, LucideAngularModule, Package, ShoppingCart } from 'lucide-angular';
import { ImageWithFallback } from '../../../shared/components/image-with-fallback/image-with-fallback';
import { CheckoutCartItem, ProductVariant } from '../../interfaces';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';
import { NgClass } from '@angular/common';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

@Component({
  selector: 'sales-product-card',
  imports: [LucideAngularModule, ImageWithFallback, NgClass],
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
  readonly infoIcon = Info;
  readonly isAdded = signal(false);

  readonly priceUnavailable = computed(() => this.variant().unitPriceCop == null);
  readonly productName = computed(() => this.variant().product?.name ?? this.variant().name);
  readonly variantName = computed(() =>
    this.variant().product?.name ? this.variant().name : this.variant().sku
  );
  readonly attributesLabel = computed(() => this.formatAttributes(this.variant().attributesJson));
  readonly images = computed(() => {
    const variant = this.variant();
    if (!variant.images || variant.images.length === 0) {
      return [
        {
          id: 'placeholder',
          url: PLACEHOLDER_IMAGE,
          alt: this.productName(),
        },
      ];
    }
    return variant.images.map((img) => ({
      id: img.id,
      url: this.catalogService.buildVariantImageUrl(variant.id, img.id),
      alt: img.altText ?? this.productName(),
    }));
  });

  readonly currentSlideIndex = signal(0);

  nextSlide(): void {
    const total = this.images().length;
    this.currentSlideIndex.update((i) => (i === total - 1 ? 0 : i + 1));
  }

  prevSlide(): void {
    const total = this.images().length;
    this.currentSlideIndex.update((i) => (i === 0 ? total - 1 : i - 1));
  }
  readonly availability = computed(() => {
    const inventory = this.variant().inventory;
    if (!inventory) {
      return {
        label: 'Disponibilidad no informada',
        className: 'text-base-content/50',
        dotClass: 'bg-base-content/40',
      };
    }

    const availableUnits = inventory.onHand - inventory.reserved;
    if (availableUnits > 0) {
      return {
        label: 'Disponible en stock',
        className: 'text-success',
        dotClass: 'bg-success',
      };
    }

    return {
      label: 'Sin stock',
      className: 'text-warning',
      dotClass: 'bg-warning',
    };
  });
  readonly addButtonClass = computed(() => {
    const base =
      'px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shrink-0';
    if (this.priceUnavailable()) {
      return `${base} bg-base-300 text-base-content/40 cursor-not-allowed`;
    }
    if (this.isAdded()) {
      return `${base} bg-success text-success-content cursor-pointer`;
    }
    return `${base} btn-primary text-primary-content cursor-pointer`;
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
    const cartItem: Omit<CheckoutCartItem, 'quantity'> = {
      variantId: variant.id,
      productName: variant.product?.name ?? variant.name,
      variantName: variant.product?.name ? variant.name : variant.sku,
      sku: variant.sku,
      gtin: variant.gtin ?? null,
      attributesJson: variant.attributesJson ?? null,
      images: variant.images ?? [],
      unitPriceCop: variant.unitPriceCop ?? null,
      inventory: {
        onHand: variant.inventory?.onHand ?? 0,
        reserved: variant.inventory?.reserved ?? 0,
        updatedAt: variant.inventory?.updatedAt,
      },
    };
    this.cartService.addItem(cartItem);

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
