export type DocumentType = 'CC' | 'CE' | 'NIT' | 'TI' | 'PAS';

export type OrderStatus =
  | 'CREATED'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export interface CheckoutProductImage {
  id: string;
  altText?: string | null;
  sortOrder: number;
  createdAt: string;
  mimeType: string;
  filename?: string | null;
}

export interface CheckoutInventoryBalance {
  onHand: number;
  reserved: number;
  updatedAt?: string;
}

export type CheckoutAttributes = Record<string, string | number | boolean | null>;

export interface CheckoutCartItem {
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  gtin?: string | null;
  attributesJson?: CheckoutAttributes | null;
  images?: CheckoutProductImage[];
  unitPriceCop: number | null;
  quantity: number;
  inventory: CheckoutInventoryBalance;
}

export interface CheckoutCartSummary {
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
}

export interface CheckoutCustomer {
  id: string;
  email: string;
  phone: string;
  name: string;
  documentType: DocumentType;
  documentNumber: string;
  userId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CheckoutAddress {
  id: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  notes?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemPayload {
  variantId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  shippingAddressId?: string;
  customerNotes?: string;
}

export interface CheckoutOrderItem {
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

export interface CheckoutOrderAddress {
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

export interface CheckoutOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  customerId?: string | null;
  buyerFullName?: string | null;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  buyerDocumentType?: string | null;
  buyerDocumentNumber?: string | null;
  subtotalAmount: string;
  shippingAmount: string;
  discountAmount: string;
  totalAmount: string;
  customerNotes?: string | null;
  internalNotes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reservationExpiresAt?: string | null;
  items: CheckoutOrderItem[];
  shippingAddress?: CheckoutOrderAddress | null;
}
