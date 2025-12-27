export type VariantStatusParam = 'active' | 'inactive' | 'all';
export type ProductStatusParam = 'published' | 'archived' | 'all';

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractRecord {
  id: string;
  customerId: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractSummary extends ContractRecord {
  _count: {
    items: number;
  };
}

export interface ContractCustomerInfo {
  id: string;
  name: string;
  email: string;
  documentType: string;
  documentNumber: string;
}

export interface ContractItem {
  id: string;
  variantId: string;
  unitPriceCop: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractWithItems extends ContractRecord {
  items: ContractItem[];
}

export interface ContractDetail extends ContractSummary {
  customer: ContractCustomerInfo;
}

export interface Variant {
  id: string;
  productId: string;
  sku: string;
  gtin?: string | null;
  name: string;
  attributesJson?: Record<string, string> | null;
  product: {
    id: string;
    name: string;
    slug: string;
    status: 'PUBLISHED' | 'ARCHIVED' | string;
  };
}

export interface ContractItemInput {
  variantId: string;
  unitPriceCop: number;
}

export interface CreateContractPayload {
  startsAt?: string;
  endsAt?: string;
}

export interface UpdateContractPayload {
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

export interface ListCustomersQuery {
  limit?: number;
  offset?: number;
  q?: string;
}

export interface ListVariantsQuery {
  limit?: number;
  offset?: number;
  status?: VariantStatusParam;
  productStatus?: ProductStatusParam;
}

export interface MessageResponse {
  message: string;
}
