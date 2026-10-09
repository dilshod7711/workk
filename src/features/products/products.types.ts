export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetProductsParams {
  limit?: number;
  skip?: number;
  select?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface SearchProductsParams extends GetProductsParams {
  q: string;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface AddProductPayload {
  title: string;
  description?: string;
  price: number;
  category?: string;
}

export interface UpdateProductPayload {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
}
