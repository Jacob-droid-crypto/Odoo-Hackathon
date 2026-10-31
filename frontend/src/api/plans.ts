import { apiClient } from './client';
import { ApiResponse, BillingInterval, SubscriptionPlan } from '../types';

export interface CreatePlanPayload {
  productId: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  billingInterval: BillingInterval;
  intervalCount?: number;
  minQuantity?: number;
  startDate?: string | null;
  endDate?: string | null;
  autoClose?: boolean;
  allowEarlyClose?: boolean;
  allowPause?: boolean;
  allowRenew?: boolean;
  isActive?: boolean;
}

export interface UpdatePlanPayload {
  productId?: string;
  name?: string;
  code?: string;
  description?: string;
  price?: number;
  billingInterval?: BillingInterval;
  intervalCount?: number;
  minQuantity?: number;
  startDate?: string | null;
  endDate?: string | null;
  autoClose?: boolean;
  allowEarlyClose?: boolean;
  allowPause?: boolean;
  allowRenew?: boolean;
  isActive?: boolean;
}

export const plansApi = {
  list: async (params?: { billingInterval?: BillingInterval; productId?: string; isActive?: boolean | string }) => {
    const res = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/plans', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<SubscriptionPlan>>(`/plans/${id}`);
    return res.data;
  },

  create: async (payload: CreatePlanPayload) => {
    const res = await apiClient.post<ApiResponse<SubscriptionPlan>>('/plans', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdatePlanPayload) => {
    const res = await apiClient.put<ApiResponse<SubscriptionPlan>>(`/plans/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/plans/${id}`);
    return res.data;
  },
};
