import { apiClient } from './client';
import { ApiResponse, Product, ProductType, ProductVariant } from '../types';

export interface CreateProductPayload {
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice?: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateProductPayload {
  name?: string;
  type?: ProductType;
  salesPrice?: number;
  costPrice?: number;
  notes?: string;
  isActive?: boolean;
}

export interface CreateVariantPayload {
  variantName: string;
  attributeName: string;
  attributeValue: string;
  priceExtra: number;
  sku?: string;
  isActive?: boolean;
}

export interface UpdateVariantPayload {
  variantName?: string;
  attributeName?: string;
  attributeValue?: string;
  priceExtra?: number;
  sku?: string;
  isActive?: boolean;
}

export const productsApi = {
  list: async (params?: { type?: string; isActive?: boolean | string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },

  create: async (payload: CreateProductPayload) => {
    const res = await apiClient.post<ApiResponse<Product>>('/products', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateProductPayload) => {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
    return res.data;
  },

  // Variants
  listVariants: async (productId: string) => {
    const res = await apiClient.get<ApiResponse<ProductVariant[]>>(`/products/${productId}/variants`);
    return res.data;
  },

  createVariant: async (productId: string, payload: CreateVariantPayload) => {
    const res = await apiClient.post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, payload);
    return res.data;
  },

  updateVariant: async (productId: string, variantId: string, payload: UpdateVariantPayload) => {
    const res = await apiClient.put<ApiResponse<ProductVariant>>(`/products/${productId}/variants/${variantId}`, payload);
    return res.data;
  },

  deleteVariant: async (productId: string, variantId: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/products/${productId}/variants/${variantId}`);
    return res.data;
  },
};
