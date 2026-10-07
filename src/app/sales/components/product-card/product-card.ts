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
  readonly quantity = signal<number>(1);

  readonly priceUnavailable = computed(() => this.variant().unitPriceCop == null);
  readonly productName = computed(() => this.variant().product?.name ?? this.variant().name);
  readonly variantName = computed(() =>
    this.variant().product?.name ? this.variant().name : this.variant().sku,
  );
  readonly attributesLabel = computed(() => this.formatAttributes(this.variant().attributesJson));
  readonly images = computed(() => {
    const variant = this.variant();
    const hasValidImages =
      variant.images &&
      variant.images.length > 0 &&
      variant.images.some((img) => img.url && img.url !== PLACEHOLDER_IMAGE);

    if (hasValidImages) {
      return variant.images!.map((img) => ({
        id: img.id,
        url: img.url ?? this.catalogService.buildVariantImageUrl(variant.id, img.id),
        alt: img.altText ?? this.productName(),
      }));
    }

    // Mapeo inteligente con los assets profesionales del catálogo
    const slug = (variant.product?.slug ?? '').toLowerCase();
    const name = (variant.product?.name ?? variant.name ?? '').toLowerCase();

    if (slug.includes('jabon') || name.includes('jabón')) {
      return [{ id: 'jabon', url: '/products/jabon-liquido.jpg', alt: this.productName() }];
    }
    if (slug.includes('desinfectante') || name.includes('desinfectante')) {
      return [{ id: 'desinfectante', url: '/products/desinfectante.jpg', alt: this.productName() }];
    }
    if (slug.includes('gel') || name.includes('gel')) {
      return [{ id: 'gel', url: '/products/gel-antibacterial.jpg', alt: this.productName() }];
    }
    if (slug.includes('toalla') || name.includes('toalla')) {
      return [{ id: 'toalla', url: '/products/toallas-papel.svg', alt: this.productName() }];
    }
    if (
      slug.includes('desengrasante') ||
      name.includes('desengrasante') ||
      slug.includes('detergente')
    ) {
      return [{ id: 'desengrasante', url: '/products/desengrasante.svg', alt: this.productName() }];
    }

    return [
      {
        id: 'placeholder',
        url: PLACEHOLDER_IMAGE,
        alt: this.productName(),
      },
    ];
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

  incrementQuantity(): void {
    if (this.priceUnavailable()) return;
    this.quantity.update((q) => q + 1);
  }

  decrementQuantity(): void {
    if (this.priceUnavailable()) return;
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    if (!raw) return;
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= 1) {
      this.quantity.set(val);
    } else {
      this.quantity.set(1);
      input.value = '1';
    }
  }

  onQuantityBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseInt(input.value.trim(), 10);
    if (isNaN(val) || val < 1) {
      this.quantity.set(1);
      input.value = '1';
    } else {
      this.quantity.set(val);
    }
  }

  readonly availability = computed(() => {
    const inventory = this.variant().inventory;
    if (!inventory) {
      return {
        label: 'Disponibilidad no informada',
        className: 'border-base-300 bg-base-100/90 text-base-content/60',
        dotClass: 'bg-base-content/40',
      };
    }

    const availableUnits = inventory.onHand - inventory.reserved;
    if (availableUnits > 0) {
      return {
        label: 'En stock',
        className: 'border-success/30 bg-base-100/90 text-success',
        dotClass: 'bg-success',
      };
    }

    return {
      label: 'Sin stock',
      className: 'border-warning/30 bg-base-100/90 text-warning',
      dotClass: 'bg-warning',
    };
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

    const qty = Math.max(1, Math.floor(Number(this.quantity()) || 1));

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
    this.cartService.addItem(cartItem, qty);

    this.isAdded.set(true);
    this.quantity.set(1);
    setTimeout(() => this.isAdded.set(false), 1200);
  }

  private formatAttributes(attributes: ProductVariant['attributesJson']): string {
    if (!attributes) {
      return '';
    }

    const entries = Object.entries(attributes).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
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
