// import { SWRConfiguration } from 'swr';

// export const swrConfig: SWRConfiguration = {
//   // Revalidate on focus (when user returns to tab)
//   revalidateOnFocus: false,
  
//   // Revalidate on reconnect (when internet reconnects)
//   revalidateOnReconnect: true,
  
//   // Dedupe requests within 2 seconds
//   dedupingInterval: 2000,
  
//   // Retry failed requests up to 3 times
//   errorRetryCount: 3,
  
//   // Retry with exponential backoff
//   errorRetryInterval: 5000,
  
//   // Focus throttling interval
//   focusThrottleInterval: 5000,
  
//   // Loading timeout
//   loadingTimeout: 10000,
  
//   // Refresh interval (disabled by default, enable per hook if needed)
//   refreshInterval: 0,
  
//   // On error handler
//   onError: (error) => {
//     console.error('SWR Error:', error);
//   },
  
//   // Fetcher function
//   fetcher: async (url: string) => {
//     const response = await fetch(url, {
//       headers: {
//         'Content-Type': 'application/json',
//         // Add auth token if available
//         ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
//           'Authorization': `Bearer ${localStorage.getItem('authToken')}`
//         })
//       }
//     });
    
//     if (!response.ok) {
//       const error = new Error('An error occurred while fetching the data.');
//       error.message = await response.text();
//       throw error;
//     }
    
//     return response.json();
//   }
// };

// // SWR keys for different data types
// export const swrKeys = {
//   // User data
//   userProfile: '/users/profile',
  
//   // Services
//   services: (filters?: any) => ['/services', filters],
//   service: (id: string) => `/services/${id}`,
//   providerServices: '/services/provider/my-services',
  
//   // Bookings
//   userBookings: '/bookings/user',
//   providerBookings: '/bookings/provider',
//   booking: (id: string) => `/bookings/${id}`,
  
//   // Reviews
//   serviceReviews: (serviceId: string) => `/reviews/${serviceId}`,
//   userReviews: '/reviews/user/my-reviews',
  
//   // Notifications
//   notifications: '/notifications',
//   unreadCount: '/notifications/unread-count',
  
//   // Wallet
//   walletTransactions: '/wallet/transactions',
// } as const; 




"use client";

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import apiClient from './api';
import Cookies from 'js-cookie'; // Import js-cookie

// 1. The Fetcher Function
// This function uses your central apiClient and correctly gets the auth token from cookies.
const fetcher = (url: string) => {
    // Note: apiClient is already configured to include the auth token in its interceptors,
    // so we don't need to manually add the header here.
    return apiClient.get(url).then(res => res.data);
};


// 2. The Custom Hook (This was the missing piece)
// This hook wraps the standard useSWR hook with our custom fetcher.
export const useSWRWrapper = <Data = any, Error = any>(
  key: string | null,
  options?: SWRConfiguration<Data, Error>
) => {
  const { data, error, isLoading, mutate, isValidating } = useSWR<Data, Error>(
    key,
    fetcher, // Use the fetcher defined above
    {
      revalidateOnFocus: false, // Sensible default
      ...options, // Allow overriding defaults
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  };
};


// 3. SWR Keys (Preserved from your previous file)
// Your existing keys are kept for consistency.
export const swrKeys = {
    // User data
    userProfile: '/users/profile',
    
    // Services
    services: (filters?: any) => ['/services', filters],
    service: (id: string) => `/services/${id}`,
    providerServices: '/services/provider/my-services',
    
    // Bookings
    userBookings: '/bookings/user',
    providerBookings: '/bookings/provider',
    booking: (id: string) => `/bookings/${id}`,
    
    // Reviews
    serviceReviews: (serviceId: string) => `/reviews/${serviceId}`,
    userReviews: '/reviews/user/my-reviews',
    
    // Notifications
    notifications: '/notifications',
    unreadCount: '/notifications/unread-count',
    
    // Wallet
    walletTransactions: '/wallet/transactions',
} as const;