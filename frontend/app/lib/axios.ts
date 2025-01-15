import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '@/app/types/api';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse<ApiResponse<T>>) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
); 