export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  gtin?: string;
  name: string;
  attributesJson?: Record<string, string | number | boolean>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    status: 'PUBLISHED' | 'ARCHIVED';
  };
  inventory?: {
    onHand: number;
    reserved: number;
    updatedAt: string;
  };
  unitPriceCop?: number | null;
  images?: ProductVariantImage[]; // Sometimes included
}

export interface ProductVariantImage {
  id: string;
  altText?: string;
  sortOrder: number;
  createdAt: string;
  mimeType: string;
  filename?: string;
  variantId: string;
  url?: string; // Helpers frontend property
}

export interface CreateVariantPayload {
  sku: string;
  gtin?: string;
  name: string;
  attributesJson?: Record<string, string | number | boolean>;
  initialOnHand?: number;
}

export interface UpdateVariantPayload {
  sku?: string;
  gtin?: string;
  name?: string;
  attributesJson?: Record<string, string | number | boolean>;
}

export interface CreateVariantImagePayload {
  file: File;
  altText?: string;
  sortOrder?: number;
}

export interface UpdateVariantImagePayload {
  altText?: string;
  sortOrder?: number;
}
