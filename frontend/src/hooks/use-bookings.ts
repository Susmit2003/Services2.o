// frontend/src/hooks/use-bookings.ts
import useSWR, { mutate } from 'swr';
import { swrKeys } from '@/lib/swr-config';
import apiClient from '@/lib/api';
import type { Booking } from '@/types';

// Hook to get user bookings
export const useUserBookings = () => {
  const { data: bookings, error, isLoading, mutate: refreshBookings } = useSWR<Booking[]>(
    swrKeys.userBookings,
    null,
    {
      revalidateOnFocus: false, // Don't revalidate on focus for bookings
      refreshInterval: 0, // Don't auto-refresh
    }
  );

  return {
    bookings: bookings || [],
    isLoading,
    error,
    refreshBookings
  };
};

// Hook to get provider bookings
export const useProviderBookings = () => {
  const { data: bookings, error, isLoading, mutate: refreshBookings } = useSWR<Booking[]>(
    swrKeys.providerBookings,
    null,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );

  return {
    bookings: bookings || [],
    isLoading,
    error,
    refreshBookings
  };
};

// Optimistic booking status update
export const updateBookingStatusOptimistic = async (bookingId: string, newStatus: string) => {
  try {
    // Optimistically update the user bookings cache
    await mutate(
      swrKeys.userBookings,
      (currentBookings: Booking[] = []) =>
        currentBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus as Booking['status'], updatedAt: new Date().toISOString() }
            : booking
        ),
      false
    );

    // Also update provider bookings cache
    await mutate(
      swrKeys.providerBookings,
      (currentBookings: Booking[] = []) =>
        currentBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus as Booking['status'], updatedAt: new Date().toISOString() }
            : booking
        ),
      false
    );

    // Make the actual API call
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status: newStatus });

    // Revalidate both caches to ensure data consistency
    await mutate(swrKeys.userBookings);
    await mutate(swrKeys.providerBookings);

    return response.data;
  } catch (error) {
    // Revalidate on error to revert the optimistic update
    await mutate(swrKeys.userBookings);
    await mutate(swrKeys.providerBookings);
    throw error;
  }
};