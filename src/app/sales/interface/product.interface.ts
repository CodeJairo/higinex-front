export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  presentation: string;
  presentationType: 'unit' | 'pack' | 'box' | 'bulk';
  unitSize: string;
  price: number;
  image: string;
  inStock: boolean;
  discount?: number;
}
