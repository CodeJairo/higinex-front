export interface Customer {
    id: string;
    userId?: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    documentType: string;
    documentNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerFilters {
    q?: string;
    limit?: number;
    offset?: number;
}
