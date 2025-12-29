export interface InventorySummary {
    totalOnHand: number;
    totalReserved: number;
    totalAvailable: number;
}

export interface InventoryBalance {
    variantId: string;
    onHand: number;
    reserved: number;
    available: number;
    updatedAt: string;
    variant: {
        id: string;
        sku: string;
        gtin: string | null;
        name: string;
        isActive: boolean;
        product: {
            id: string;
            name: string;
            slug: string;
            status: string;
        };
    };
}

export interface InventoryMovement {
    id: string;
    occurredAt: string;
    type: 'IN' | 'OUT' | 'SOLD' | 'RESERVED' | 'UNRESERVED' | 'ADJUSTMENT';
    reason: string;
    quantity: number;
    notes?: string;
    variantId: string;
    variantName?: string;
    variantSku?: string;
    productName?: string;
    orderId?: string;
    createdByEmail?: string;
    variant?: {
        id: string;
        sku: string;
        name: string;
        product: {
            id: string;
            name: string;
            slug: string;
        };
    };
}

export interface InventoryAdjustmentPayload {
    variantId: string;
    quantity: number;
    reason: string;
    notes?: string;
}
