import { apiClient } from './client';
import { ApiResponse, AuthResponseData, User } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return res.data;
  },

  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return res.data;
  },

  me: async (): Promise<ApiResponse<{ user: User }>> => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ApiResponse<{ resetToken: string; resetUrl: string; expiresAt: string }>> => {
    const res = await apiClient.post<ApiResponse<{ resetToken: string; resetUrl: string; expiresAt: string }>>('/auth/forgot-password', payload);
    return res.data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/reset-password', payload);
    return res.data;
  },
};
