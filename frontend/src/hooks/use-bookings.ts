"use client";

import { useSWRConfig } from 'swr';
import { createBooking } from '@/lib/actions/booking.actions';
import type { Booking } from '@/types';

// This custom hook manages booking data with optimistic UI updates.
export function useBookings() {
    const { mutate } = useSWRConfig();

    // The component is trying to import this specific function.
    const createBookingOptimistic = async (bookingData: any) => {
        try {
            // Call the actual server action to create the booking.
            await createBooking(bookingData);
            
            // Immediately refetch the user's bookings to show the new one in their dashboard.
            // The key '/api/bookings/user' should match the SWR key used to fetch user bookings.
            mutate('/api/bookings/user');

        } catch (error) {
            console.error("Optimistic booking creation failed:", error);
            // Re-throw the error so the component's error handling can catch it.
            throw error;
        }
    };

    return { createBookingOptimistic };
}