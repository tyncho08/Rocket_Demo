import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getSession } from 'next-auth/react';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get session for client-side requests
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        // Redirect to login on client side
        window.location.href = '/login';
      }
    }
    
    // Extract error message
    const message = (error.response?.data as any)?.message || 
                   error.message || 
                   'An unexpected error occurred';
    
    return Promise.reject(new Error(message));
  }
);

// Server-side API client (for use in server components)
export const createServerApiClient = (accessToken?: string): AxiosInstance => {
  const serverClient = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:5001/api',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    },
    timeout: 30000
  });

  serverClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const message = (error.response?.data as any)?.message || 
                     error.message || 
                     'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }
  );

  return serverClient;
};

export default apiClient;