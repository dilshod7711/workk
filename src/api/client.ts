import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from '../utils/cookie';

export const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      const refreshToken = getCookie('refreshToken');
      
      if (refreshToken) {
        try {
          const { data } = await axios.post('https://dummyjson.com/auth/refresh', {
            refreshToken: refreshToken,
            expiresInMins: 1, 
          });
          

          setCookie('token', data.accessToken, 1); 
          if (data.refreshToken) {
            setCookie('refreshToken', data.refreshToken, 60);
          }
          
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
          
        } catch (err) {
        }
      }

      deleteCookie('token');
      deleteCookie('refreshToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
