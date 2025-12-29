export interface CustomerLite {
    id: string;
    name: string;
    email: string;
    phone: string;
    documentType: string;
    documentNumber: string;
    createdAt: string;
}

export interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
    isActive: boolean;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    customer?: CustomerLite;
}

export interface UserFilters {
    q?: string;
    role?: 'ADMIN' | 'USER';
    isActive?: boolean | string;
    hasCustomer?: boolean | string;
    limit?: number;
    offset?: number;
}
