// frontend/src/lib/api.ts
import axios from 'axios';
import { triggerGlobalLoading } from '@/context/loading-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

const isClient = typeof window !== 'undefined';

apiClient.interceptors.request.use(config => {
  if (isClient) {
    console.log('[Loader] API request started:', config.url);
    triggerGlobalLoading(true);
  }
  return config;
}, error => {
  if (isClient) {
    console.log('[Loader] API request error:', error);
    triggerGlobalLoading(false);
  }
  return Promise.reject(error);
});

apiClient.interceptors.response.use(response => {
  if (isClient) {
    console.log('[Loader] API response received:', response.config.url);
    triggerGlobalLoading(false);
  }
  return response;
}, error => {
  if (isClient) {
    console.log('[Loader] API response error:', error);
    triggerGlobalLoading(false);
  }
  return Promise.reject(error);
});

export default apiClient;