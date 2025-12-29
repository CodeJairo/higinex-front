export interface CustomerAddress {
    id: string; // uuid
    label?: string;
    line1: string;
    line2?: string;
    neighborhood?: string;
    city: string;
    state: string;
    postalCode?: string;
    notes?: string;
    isDefault: boolean;
    createdAt: string; // ISO
    updatedAt: string; // ISO
}

export interface ListCustomerAddressesQuery {
    limit?: number;
    offset?: number;
}

export interface CreateCustomerAddressPayload {
    label?: string;
    line1: string;
    line2?: string;
    neighborhood?: string;
    city: string;
    state: string;
    postalCode?: string;
    notes?: string;
    isDefault?: boolean;
}

export interface UpdateCustomerAddressPayload {
    label?: string;
    line1?: string;
    line2?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    notes?: string;
}

export interface MessageResponse {
    message: string;
}
