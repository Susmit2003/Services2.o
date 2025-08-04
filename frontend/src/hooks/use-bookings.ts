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

// Hook to get a specific booking
export const useBooking = (bookingId: string) => {
  const { data: booking, error, isLoading, mutate: refreshBooking } = useSWR<Booking>(
    bookingId ? swrKeys.booking(bookingId) : null,
    null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    booking,
    isLoading,
    error,
    refreshBooking
  };
};

// Optimistic booking creation
export const createBookingOptimistic = async (bookingData: any) => {
  try {
    // Create optimistic booking object
    const optimisticBooking: Booking = {
      id: `temp-${Date.now()}`,
      serviceId: bookingData.serviceId,
      service: {
        id: bookingData.serviceId,
        title: 'Loading...',
        description: '',
        category: '',
        price: 0,
        images: [],
        providerName: '',
        providerId: '',
        zipCodes: [],
        timeSlots: [],
        status: 'Active',
        availability: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      userId: bookingData.bookedByUserId,
      providerId: bookingData.providerId,
      bookingDate: bookingData.serviceDate,
      timeSlot: bookingData.timeSlot,
      status: 'pending',
      totalPrice: bookingData.servicePrice,
      address: bookingData.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update the cache
    await mutate(
      swrKeys.userBookings,
      (currentBookings: Booking[] = []) => [optimisticBooking, ...currentBookings],
      false // Don't revalidate immediately
    );

    // Make the actual API call
    const response = await apiClient.post('/bookings/create', bookingData);
    const realBooking = response.data;

    // Update cache with real data
    await mutate(
      swrKeys.userBookings,
      (currentBookings: Booking[] = []) => 
        currentBookings.map(booking => 
          booking.id === optimisticBooking.id ? realBooking : booking
        ),
      false
    );

    // Revalidate to ensure consistency
    await mutate(swrKeys.userBookings);

    return realBooking;
  } catch (error) {
    // Revalidate on error to remove optimistic update
    await mutate(swrKeys.userBookings);
    throw error;
  }
};

// Optimistic booking status update
export const updateBookingStatusOptimistic = async (bookingId: string, newStatus: string) => {
  try {
    // Optimistically update the cache
    await mutate(
      swrKeys.userBookings,
      (currentBookings: Booking[] = []) =>
        currentBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
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
            ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
            : booking
        ),
      false
    );

    // Make the actual API call
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status: newStatus });

    // Revalidate both caches
    await mutate(swrKeys.userBookings);
    await mutate(swrKeys.providerBookings);

    return response.data;
  } catch (error) {
    // Revalidate on error to remove optimistic update
    await mutate(swrKeys.userBookings);
    await mutate(swrKeys.providerBookings);
    throw error;
  }
};

// Invalidate booking caches
export const invalidateBookingCaches = async () => {
  await mutate(swrKeys.userBookings);
  await mutate(swrKeys.providerBookings);
}; 