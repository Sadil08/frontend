import apiClient from '@/utils/apiClient';
import { JwtResponse, UserResponse } from '@/types';

export const login = async (email: string, password: string): Promise<JwtResponse> => {
  const response = await apiClient.post<JwtResponse>('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, password: string, name: string, referralCode?: string): Promise<UserResponse> => {
  const response = await apiClient.post<UserResponse>('/api/auth/register', { email, password, name, referralCode });
  return response.data;
};