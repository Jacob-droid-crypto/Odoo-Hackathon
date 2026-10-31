import { apiClient } from './client';
import { ApiResponse, Role, User } from '../types';

export interface CreateStaffPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const usersApi = {
  createStaff: async (payload: CreateStaffPayload) => {
    const res = await apiClient.post<ApiResponse<{ staff: User }>>('/users/staff', payload);
    return res.data;
  },

  list: async (params?: { role?: Role; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },
};
