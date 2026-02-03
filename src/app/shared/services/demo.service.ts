import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerAddress } from '../../customer/interfaces/customer-address.interface';

// Demo data interfaces
export interface DemoCustomer {
  id: string;
  email: string;
  phone: string;
  name: string;
  documentType: string;
  documentNumber: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DemoProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  variants: DemoVariant[];
}

export interface DemoVariant {
  id: string;
  name: string;
  sku: string;
  gtin?: string | null;
  attributesJson?: Record<string, unknown> | null;
  images?: DemoImage[];
  inventory?: DemoInventoryBalance;
  price?: DemoPrice;
}

export interface DemoImage {
  id: string;
  altText?: string | null;
  isDefault: boolean;
  createdAt: string;
  mimeType: string;
  filename?: string | null;
}

export interface DemoInventoryBalance {
  variantId: string;
  onHand: number;
  reserved: number;
  updatedAt?: string;
}

export interface DemoPrice {
  id: string;
  variantId: string;
  customerId?: string | null;
  amountCop: number;
  startDate: string;
  endDate?: string | null;
}

export interface DemoContract {
  id: string;
  customerId: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  terms?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  customerId?: string | null;
  buyerFullName?: string | null;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  buyerDocumentType?: string | null;
  buyerDocumentNumber?: string | null;
  subtotalAmount: string;
  shippingAmount: string;
  taxesAmount: string;
  discountAmount: string;
  totalAmount: string;
  customerNotes?: string | null;
  internalNotes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reservationExpiresAt?: string | null;
  items: DemoOrderItem[];
  shippingAddress?: DemoOrderAddress | null;
}

export interface DemoOrderItem {
  id: string;
  orderId: string;
  variantId?: string | null;
  skuSnapshot?: string | null;
  gtinSnapshot?: string | null;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  unitPriceAmount: string;
  quantity: number;
  lineTotalAmount: string;
}

export interface DemoOrderAddress {
  id: string;
  orderId: string;
  recipientName?: string | null;
  phone?: string | null;
  line1: string;
  line2?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  notes?: string | null;
}

export interface DemoData {
  customer: DemoCustomer | null;
  products: DemoProduct[];
  contracts: DemoContract[];
  inventory: DemoInventoryBalance[];
  orders: DemoOrder[];
  addresses: CustomerAddress[];
}

export type DemoUserType = 'admin' | 'user';

interface DemoInitialDataResponse {
  customer: DemoCustomer;
  products: DemoProduct[];
  contracts: DemoContract[];
  inventory: DemoInventoryBalance[];
  orders: DemoOrder[];
  addresses: CustomerAddress[];
}

const STORAGE_KEYS = {
  MODE: 'higinex.demo.mode',
  EMAIL: 'higinex.demo.email',
  TYPE: 'higinex.demo.type',
  DATA: 'higinex.demo.data',
  CART: 'higinex.demo.cart',
} as const;

@Injectable({ providedIn: 'root' })
export class DemoService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

  // Signals
  private readonly isDemoModeSignal = signal<boolean>(this.loadDemoModeFromStorage());
  private readonly demoEmailSignal = signal<string | null>(this.loadEmailFromStorage());
  private readonly demoTypeSignal = signal<DemoUserType | null>(this.loadTypeFromStorage());
  private readonly demoDataSignal = signal<DemoData>(this.loadDataFromStorage());

  // Public readonly signals
  readonly isDemoMode = this.isDemoModeSignal.asReadonly();
  readonly demoEmail = this.demoEmailSignal.asReadonly();
  readonly demoType = this.demoTypeSignal.asReadonly();
  readonly demoData = this.demoDataSignal.asReadonly();

  // Computed signals for convenience
  readonly isAdminDemo = computed(() => this.isDemoMode() && this.demoType() === 'admin');
  readonly isUserDemo = computed(() => this.isDemoMode() && this.demoType() === 'user');

  /**
   * Initialize demo mode by fetching initial data from the backend.
   */
  async initializeDemoMode(email: string, type: DemoUserType): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<DemoInitialDataResponse>(this.buildUrl('/demo/initial-data'))
      );

      const demoData: DemoData = {
        customer: response.customer ?? null,
        products: response.products ?? [],
        contracts: response.contracts ?? [],
        inventory: response.inventory ?? [],
        orders: response.orders ?? [],
        addresses: response.addresses ?? [],
      };

      // Save to sessionStorage
      this.saveToSessionStorage(STORAGE_KEYS.MODE, 'true');
      this.saveToSessionStorage(STORAGE_KEYS.EMAIL, email);
      this.saveToSessionStorage(STORAGE_KEYS.TYPE, type);
      this.saveToSessionStorage(STORAGE_KEYS.DATA, JSON.stringify(demoData));

      // Update signals
      this.isDemoModeSignal.set(true);
      this.demoEmailSignal.set(email);
      this.demoTypeSignal.set(type);
      this.demoDataSignal.set(demoData);

      return true;
    } catch (error) {
      console.error('Failed to initialize demo mode:', error);
      return false;
    }
  }

  /**
   * Exit demo mode and clear all demo data.
   */
  exitDemoMode(): void {
    // Clear sessionStorage
    this.removeFromSessionStorage(STORAGE_KEYS.MODE);
    this.removeFromSessionStorage(STORAGE_KEYS.EMAIL);
    this.removeFromSessionStorage(STORAGE_KEYS.TYPE);
    this.removeFromSessionStorage(STORAGE_KEYS.DATA);
    this.removeFromSessionStorage(STORAGE_KEYS.CART);

    // Reset signals
    this.isDemoModeSignal.set(false);
    this.demoEmailSignal.set(null);
    this.demoTypeSignal.set(null);
    this.demoDataSignal.set(this.getEmptyDemoData());
  }

  // === Mutation Methods ===

  /**
   * Add a new order to demo data.
   */
  addDemoOrder(order: DemoOrder): void {
    this.demoDataSignal.update((data) => ({
      ...data,
      orders: [...data.orders, order],
    }));
    this.persistDemoData();
  }

  /**
   * Update inventory balance for a variant.
   */
  updateDemoInventory(variantId: string, updates: Partial<DemoInventoryBalance>): void {
    this.demoDataSignal.update((data) => ({
      ...data,
      inventory: data.inventory.map((item) =>
        item.variantId === variantId ? { ...item, ...updates } : item
      ),
    }));
    this.persistDemoData();
  }

  /**
   * Add a new address to demo data.
   */
  addDemoAddress(address: CustomerAddress): void {
    this.demoDataSignal.update((data) => ({
      ...data,
      addresses: [...data.addresses, address],
    }));
    this.persistDemoData();
  }

  /**
   * Update an existing address in demo data.
   */
  updateDemoAddress(addressId: string, updates: Partial<CustomerAddress>): void {
    this.demoDataSignal.update((data) => ({
      ...data,
      addresses: data.addresses.map((addr) =>
        addr.id === addressId ? { ...addr, ...updates } : addr
      ),
    }));
    this.persistDemoData();
  }

  /**
   * Delete an address from demo data.
   */
  deleteDemoAddress(addressId: string): void {
    this.demoDataSignal.update((data) => ({
      ...data,
      addresses: data.addresses.filter((addr) => addr.id !== addressId),
    }));
    this.persistDemoData();
  }

  /**
   * Set an address as default in demo data.
   */
  setDemoDefaultAddress(addressId: string): void {
    this.demoDataSignal.update((data) => ({
      ...data,
      addresses: data.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    }));
    this.persistDemoData();
  }

  /**
   * Update order status in demo data.
   */
  updateDemoOrderStatus(orderId: string, status: string): void {
    this.demoDataSignal.update((data) => ({
      ...data,
      orders: data.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ),
    }));
    this.persistDemoData();
  }

  // === Getters ===

  getDemoOrders(): DemoOrder[] {
    return this.demoDataSignal().orders;
  }

  getDemoAddresses(): CustomerAddress[] {
    return this.demoDataSignal().addresses;
  }

  getDemoInventory(): DemoInventoryBalance[] {
    return this.demoDataSignal().inventory;
  }

  getDemoProducts(): DemoProduct[] {
    return this.demoDataSignal().products;
  }

  getDemoContracts(): DemoContract[] {
    return this.demoDataSignal().contracts;
  }

  getDemoCustomer(): DemoCustomer | null {
    return this.demoDataSignal().customer;
  }

  // === Private Methods ===

  private loadDemoModeFromStorage(): boolean {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return false;
    }
    return sessionStorage.getItem(STORAGE_KEYS.MODE) === 'true';
  }

  private loadEmailFromStorage(): string | null {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(STORAGE_KEYS.EMAIL);
  }

  private loadTypeFromStorage(): DemoUserType | null {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return null;
    }
    const type = sessionStorage.getItem(STORAGE_KEYS.TYPE);
    if (type === 'admin' || type === 'user') {
      return type;
    }
    return null;
  }

  private loadDataFromStorage(): DemoData {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return this.getEmptyDemoData();
    }

    const dataStr = sessionStorage.getItem(STORAGE_KEYS.DATA);
    if (!dataStr) {
      return this.getEmptyDemoData();
    }

    try {
      return JSON.parse(dataStr) as DemoData;
    } catch {
      return this.getEmptyDemoData();
    }
  }

  private getEmptyDemoData(): DemoData {
    return {
      customer: null,
      products: [],
      contracts: [],
      inventory: [],
      orders: [],
      addresses: [],
    };
  }

  private persistDemoData(): void {
    this.saveToSessionStorage(STORAGE_KEYS.DATA, JSON.stringify(this.demoDataSignal()));
  }

  private saveToSessionStorage(key: string, value: string): void {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  }

  private removeFromSessionStorage(key: string): void {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }

  private buildUrl(path: string): string {
    if (!this.apiBaseUrl) {
      return path;
    }
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }
}
