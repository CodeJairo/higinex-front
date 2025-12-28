import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem } from '../interfaces';

const CART_STORAGE_KEY = 'higinex_cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this.itemsSignal.asReadonly();

  readonly totalItems = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.itemsSignal().reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  );

  readonly tax = computed(() => this.subtotal() * 0.19); // IVA 19%

  readonly total = computed(() => this.subtotal() + this.tax());

  constructor() {
    // Persist cart to localStorage whenever it changes
    effect(() => {
      this.saveToStorage(this.itemsSignal());
    });
  }

  private loadFromStorage(): CartItem[] {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          return [];
        }
      }
    }
    return [];
  }

  private saveToStorage(items: CartItem[]): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }

  addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    this.itemsSignal.update((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === item.id);

      if (existingItem) {
        return currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        return [...currentItems, { ...item, quantity }];
      }
    });
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }

    this.itemsSignal.update((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }

  removeItem(id: string): void {
    this.itemsSignal.update((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  clearCart(): void {
    this.itemsSignal.set([]);
  }
}
