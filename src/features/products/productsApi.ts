import { apiClient } from '../../api/client';
import type { 
  ProductsResponse, 
  Product, 
  GetProductsParams, 
  SearchProductsParams,
  Category,
  AddProductPayload,
  UpdateProductPayload
} from './products.types';

export const getProducts = async (params?: GetProductsParams): Promise<ProductsResponse> => {
  const response = await apiClient.get<ProductsResponse>('/products', { params });
  return response.data;
};

export const searchProducts = async (searchData: SearchProductsParams): Promise<ProductsResponse> => {
  const { q, ...rest } = searchData;
  const response = await apiClient.get<ProductsResponse>(`/products/search`, {
    params: { q, ...rest }
  });
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/products/categories');
  return response.data;
};

export const getProductsByCategory = async (category: string, params?: GetProductsParams): Promise<ProductsResponse> => {
  const response = await apiClient.get<ProductsResponse>(`/products/category/${category}`, { params });
  return response.data;
};

export const addProduct = async (data: AddProductPayload): Promise<Product> => {
  const response = await apiClient.post<Product>('/products/add', data);
  return response.data;
};

export const updateProduct = async (id: number, data: UpdateProductPayload): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<Product & { isDeleted: boolean; deletedOn: string }> => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};
