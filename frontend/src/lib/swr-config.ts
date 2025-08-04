import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  // Revalidate on focus (when user returns to tab)
  revalidateOnFocus: false,
  
  // Revalidate on reconnect (when internet reconnects)
  revalidateOnReconnect: true,
  
  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,
  
  // Retry failed requests up to 3 times
  errorRetryCount: 3,
  
  // Retry with exponential backoff
  errorRetryInterval: 5000,
  
  // Focus throttling interval
  focusThrottleInterval: 5000,
  
  // Loading timeout
  loadingTimeout: 10000,
  
  // Refresh interval (disabled by default, enable per hook if needed)
  refreshInterval: 0,
  
  // On error handler
  onError: (error) => {
    console.error('SWR Error:', error);
  },
  
  // Fetcher function
  fetcher: async (url: string) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if available
        ...(typeof window !== 'undefined' && localStorage.getItem('authToken') && {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        })
      }
    });
    
    if (!response.ok) {
      const error = new Error('An error occurred while fetching the data.');
      error.message = await response.text();
      throw error;
    }
    
    return response.json();
  }
};

// SWR keys for different data types
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