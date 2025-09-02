// "use client";

// import { useSWRConfig } from 'swr';
// import { createBooking } from '@/lib/actions/booking.actions';
// import type { Booking } from '@/types';

// // This custom hook manages booking data with optimistic UI updates.
// export function useBookings() {
//     const { mutate } = useSWRConfig();

//     // The component is trying to import this specific function.
//     const createBookingOptimistic = async (bookingData: any) => {
//         try {
//             // Call the actual server action to create the booking.
//             await createBooking(bookingData);
            
//             // Immediately refetch the user's bookings to show the new one in their dashboard.
//             // The key '/api/bookings/user' should match the SWR key used to fetch user bookings.
//             mutate('/api/bookings/user');

//         } catch (error) {
//             console.error("Optimistic booking creation failed:", error);
//             // Re-throw the error so the component's error handling can catch it.
//             throw error;
//         }
//     };

//     return { createBookingOptimistic };
// }




"use client";

import { useSWRWrapper, swrKeys } from '@/lib/swr-config';
import { createBooking } from '@/lib/actions/booking.actions';
import { useAuth } from '@/context/auth-context';
import type { Booking } from '@/types';

export const useBookings = () => {
    const { currentUser } = useAuth();

    // ✅ FIX: Use the SWR wrapper to actually fetch the user's bookings
    const { data: bookings, isLoading, error, mutate } = useSWRWrapper<Booking[]>(
        currentUser ? swrKeys.userBookings : null
    );

    // This function can remain for creating new bookings
    const createBookingOptimistic = async (bookingData: any) => {
        try {
            // You can add optimistic UI updates here if needed
            await createBooking(bookingData);
            // Revalidate the list of bookings after a new one is created
            mutate();
        } catch (err) {
            console.error("Failed to create booking:", err);
            // Optionally, revert optimistic updates and show an error toast
            throw err;
        }
    };

    // ✅ FIX: Return all the properties that the page component expects
    return { 
        bookings, 
        isLoading, 
        error, 
        createBookingOptimistic 
    };
};