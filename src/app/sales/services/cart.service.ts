import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DemoService } from '../../shared/services/demo.service';
import { CheckoutCartItem, CheckoutCartSummary } from '../interfaces';

const CART_STORAGE_KEY = 'higinex_cart';
const DEMO_CART_STORAGE_KEY = 'higinex.demo.cart';
const DEFAULT_CURRENCY = 'COP';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly demoService = inject(DemoService);
  private readonly itemsSignal = signal<CheckoutCartItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();

  readonly totalItems = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotalAmount = computed(() =>
    this.itemsSignal().reduce(
      (sum, item) => sum + (item.unitPriceCop ?? 0) * item.quantity,
      0
    )
  );

  readonly summary = computed<CheckoutCartSummary>(() => {
    const totalItemValue = this.subtotalAmount();
    const shippingAmount = 0;
    const discountAmount = 0;

    // Asumimos IVA del 19% incluido en el precio
    const taxAmount = Math.round(totalItemValue - totalItemValue / 1.19);
    const subtotalAmount = totalItemValue - taxAmount;

    return {
      subtotalAmount,
      shippingAmount,
      taxAmount,
      discountAmount,
      totalAmount: totalItemValue + shippingAmount - discountAmount,
      currency: DEFAULT_CURRENCY,
    };
  });

  readonly hasPriceIssues = computed(() =>
    this.itemsSignal().some((item) => item.unitPriceCop == null)
  );

  readonly hasStockIssues = computed(() =>
    this.itemsSignal().some((item) => this.getAvailable(item) <= 0)
  );

  constructor() {
    effect(() => {
      this.saveToStorage(this.itemsSignal());
    });
  }

  getAvailable(item: CheckoutCartItem): number {
    return item.inventory.onHand - item.inventory.reserved;
  }

  addItem(item: Omit<CheckoutCartItem, 'quantity'>, quantity: number = 1): void {
    const normalizedQuantity = this.normalizeQuantity(quantity);
    if (normalizedQuantity <= 0) {
      return;
    }
    this.itemsSignal.update((currentItems) => {
      const existingItem = currentItems.find((i) => i.variantId === item.variantId);

      if (existingItem) {
        return currentItems.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + normalizedQuantity }
            : i
        );
      }

      return [...currentItems, { ...item, quantity: normalizedQuantity }];
    });
  }

  updateQuantity(variantId: string, quantity: number): void {
    const normalizedQuantity = this.normalizeQuantity(quantity);
    if (normalizedQuantity <= 0) {
      this.removeItem(variantId);
      return;
    }

    this.itemsSignal.update((currentItems) =>
      currentItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity: normalizedQuantity } : item
      )
    );
  }

  removeItem(variantId: string): void {
    this.itemsSignal.update((currentItems) =>
      currentItems.filter((item) => item.variantId !== variantId)
    );
  }

  clearCart(): void {
    this.itemsSignal.set([]);
  }

  private getStorageKey(): string {
    return this.demoService.isDemoMode() ? DEMO_CART_STORAGE_KEY : CART_STORAGE_KEY;
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return this.demoService.isDemoMode() ? sessionStorage : localStorage;
  }

  private loadFromStorage(): CheckoutCartItem[] {
    const storage = this.getStorage();
    if (!storage) {
      return [];
    }
    const savedCart = storage.getItem(this.getStorageKey());
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (!Array.isArray(parsed)) {
          return [];
        }
        return parsed
          .map((item) => this.normalizeItem(item))
          .filter((item): item is CheckoutCartItem => !!item);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        return [];
      }
    }
    return [];
  }

  private saveToStorage(items: CheckoutCartItem[]): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.getStorageKey(), JSON.stringify(items));
    }
  }

  private normalizeItem(raw: unknown): CheckoutCartItem | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const item = raw as Partial<CheckoutCartItem> & {
      id?: string;
      name?: string;
      presentation?: string;
      unitPrice?: number;
      image?: string;
      quantity?: number;
    };

    if (
      typeof item.variantId === 'string' &&
      typeof item.productName === 'string' &&
      typeof item.variantName === 'string' &&
      typeof item.sku === 'string' &&
      item.inventory &&
      typeof item.inventory.onHand === 'number' &&
      typeof item.inventory.reserved === 'number'
    ) {
      return {
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        gtin: item.gtin ?? null,
        attributesJson: item.attributesJson ?? null,
        images: item.images ?? [],
        unitPriceCop: typeof item.unitPriceCop === 'number' ? item.unitPriceCop : null,
        quantity: this.normalizeQuantity(item.quantity ?? 1),
        inventory: {
          onHand: item.inventory.onHand,
          reserved: item.inventory.reserved,
          updatedAt: item.inventory.updatedAt,
        },
      };
    }

    if (typeof item.id === 'string' && typeof item.name === 'string') {
      const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : null;
      return {
        variantId: item.id,
        productName: item.name,
        variantName: item.presentation ?? item.name,
        sku: item.presentation ?? item.id,
        gtin: null,
        attributesJson: null,
        images: [],
        unitPriceCop: unitPrice,
        quantity: this.normalizeQuantity(item.quantity ?? 1),
        inventory: {
          onHand: 0,
          reserved: 0,
        },
      };
    }

    return null;
  }

  private normalizeQuantity(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.floor(value));
  }
}
