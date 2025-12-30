export enum OrderStatus {
    CREATED = 'CREATED',
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    PAID = 'PAID',
    PREPARING = 'PREPARING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELED = 'CANCELED',
    RETURN_REQUESTED = 'RETURN_REQUESTED',
    RETURNED = 'RETURNED',
    REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
    BANK_TRANSFER = 'BANK_TRANSFER',
    CARD_TERMINAL = 'CARD_TERMINAL',
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
    EXTERNAL_LINK = 'EXTERNAL_LINK',
    OTHER = 'OTHER',
}

export enum RefundMethod {
    BANK_TRANSFER = 'BANK_TRANSFER',
    REVERSAL = 'REVERSAL',
    CASH = 'CASH',
    OTHER = 'OTHER',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    REJECTED = 'REJECTED',
    VOIDED = 'VOIDED',
}

export enum ShipmentStatus {
    CREATED = 'CREATED',
    DISPATCHED = 'DISPATCHED',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    INCIDENT = 'INCIDENT',
}

export enum ReturnStatus {
    REQUESTED = 'REQUESTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    RECEIVED = 'RECEIVED',
    CLOSED = 'CLOSED',
}

export enum RefundStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    VOIDED = 'VOIDED',
}

export enum OrderNoteVisibility {
    INTERNAL = 'INTERNAL',
    CUSTOMER = 'CUSTOMER',
}

export enum ReturnReason {
    DEFECT = 'DEFECT',
    WITHDRAWAL = 'WITHDRAWAL',
    SHIPPING_ERROR = 'SHIPPING_ERROR',
    OTHER = 'OTHER',
}

export interface OrderItem {
    id: string;
    orderId: string;
    variantId: string | null;
    skuSnapshot: string;
    gtinSnapshot?: string;
    productNameSnapshot: string;
    variantNameSnapshot: string;
    quantity: number;
    unitPriceAmount: string | number;
    lineTotalAmount: string | number;
}

export interface OrderShippingAddress {
    recipientName: string;
    phone: string;
    line1: string;
    line2?: string;
    neighborhood?: string;
    city: string;
    state: string;
    postalCode: string;
    notes?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    currency: string;
    customerId?: string | null;
    buyerFullName?: string | null;
    buyerEmail?: string | null;
    buyerPhone?: string | null;
    buyerDocumentType?: string;
    buyerDocumentNumber?: string;
    subtotalAmount: string | number;
    taxesAmount: string | number;
    shippingAmount: string | number;
    discountAmount: string | number;
    totalAmount: string | number;
    paidAt?: string | null;
    createdAt: string;
    updatedAt: string;
    reservationExpiresAt?: string | null;
    items?: OrderItem[];
    shippingAddress?: OrderShippingAddress;
}

export interface OrderListResponse {
    data: Order[];
    totalCount?: number;
}

export interface OrderFilters {
    limit?: number;
    offset?: number;
    status?: OrderStatus;
    customerId?: string;
    orderNumber?: string;
    q?: string;
    dateFrom?: string;
    dateTo?: string;
    includeCount?: string; // "true" | "false"
}

export interface ConfirmPaymentPayload {
    method: PaymentMethod;
    amount?: number;
    reference?: string;
    notes?: string;
}

export interface CancelOrderPayload {
    comment?: string;
}

export interface UpdateOrderStatusPayload {
    status: OrderStatus;
    comment?: string;
}

export interface OrderNote {
    id: string;
    orderId: string;
    visibility: OrderNoteVisibility;
    message: string;
    createdAt: string;
    createdByUserId: string;
    createdBy?: {
        id: string;
        email: string;
    };
}

export interface CreateOrderNotePayload {
    visibility?: OrderNoteVisibility;
    message: string;
}

export interface Shipment {
    id: string;
    orderId: string;
    carrierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    status: ShipmentStatus;
    shippingCostAmount?: string | number;
    shippedAt?: string;
    deliveredAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateShipmentPayload {
    carrierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    status?: ShipmentStatus;
    shippingCostAmount?: number;
}

export interface UpdateShipmentPayload {
    carrierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    status?: ShipmentStatus;
    shippingCostAmount?: number;
}

export interface Payment {
    id: string;
    orderId: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: string | number;
    paidAt?: string;
    reference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReturnItem {
    id: string;
    returnId: string;
    orderItemId: string;
    quantity: number;
    restock: boolean;
    restockCondition?: string;
}

export interface ReturnRequest {
    id: string;
    orderId: string;
    status: ReturnStatus;
    reason: ReturnReason;
    customerNotes?: string;
    internalNotes?: string;
    createdAt: string;
    updatedAt: string;
    items: ReturnItem[];
}

export interface CreateReturnItemPayload {
    orderItemId: string;
    quantity: number;
    restock?: boolean;
    restockCondition?: string;
}

export interface CreateReturnPayload {
    reason: ReturnReason;
    customerNotes?: string;
    internalNotes?: string;
    items: CreateReturnItemPayload[];
}

export interface UpdateReturnPayload {
    status?: ReturnStatus;
    internalNotes?: string;
}

export interface Refund {
    id: string;
    orderId: string;
    paymentId?: string;
    amount: string | number;
    method: RefundMethod;
    status: RefundStatus;
    processedAt?: string;
    reference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRefundPayload {
    amount: number;
    method: RefundMethod;
    status?: RefundStatus;
    paymentId?: string;
    reference?: string;
    notes?: string;
}

export interface UpdateRefundPayload {
    amount?: number;
    method?: RefundMethod;
    status?: RefundStatus;
    paymentId?: string;
    reference?: string;
    notes?: string;
}

export interface ExpireReservationsResponse {
    checkedCount: number;
    expiredCount: number;
    expiredOrderIds: string[];
}
