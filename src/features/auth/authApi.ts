import { apiClient } from '../../api/client';
import type { AuthLogin, AuthResponse } from './auth.types';
 
export const loginUser = async (data: AuthLogin): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    ...data,
    expiresInMins: data.expiresInMins || 1, 
  });
  return response.data;
};
