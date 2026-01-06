export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT' | string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VariantImage {
  id: string;
  altText: string;
  // sortOrder removed
  isDefault: boolean;
  createdAt: string;
  mimeType: string;
  filename: string;
}

export interface VariantInventory {
  onHand: number;
  reserved: number;
  updatedAt: string;
}

export type VariantAttributes = Record<string, string | number | boolean | null>;

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  gtin: string;
  name: string;
  attributesJson: VariantAttributes;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    status: 'PUBLISHED' | 'DRAFT' | string;
  };
  images?: VariantImage[];
  inventory?: VariantInventory | null;
  unitPriceCop: number | null;
}
