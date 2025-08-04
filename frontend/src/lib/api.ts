import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create a re-usable axios instance with a base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * This is an interceptor. It's a powerful feature that allows you to
 * run code before a request is sent. Here, we use it to automatically
 * add the user's authentication token to every API request.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Check if the code is running in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        // If a token exists, add it to the Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;