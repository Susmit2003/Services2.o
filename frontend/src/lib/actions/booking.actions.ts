'use server';

import apiClient from '../api';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type { Booking, BookingFormData } from '@/types';

// Helper function to get authorization headers from cookies for server-side requests
const getAuthHeaders = () => {
    const token = cookies().get('authToken')?.value;
    if (!token) throw new Error('Not authorized, no token found');
    return {
        Authorization: `Bearer ${token}`,
    };
};

/**
 * Creates a new booking for the authenticated user.
 * @param bookingData The data required for creating a booking.
 * @returns The newly created booking object.
 */
export async function createBooking(bookingData: BookingFormData) {
  try {
    const response = await apiClient.post('/bookings/create', bookingData, { headers: getAuthHeaders() });
    revalidatePath('/bookings'); // Revalidate the user's booking list
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Your booking could not be completed.');
  }
}

/**
 * Fetches all bookings made by the currently authenticated user.
 * @returns An array of booking objects.
 */
export async function getUserBookings(): Promise<Booking[]> {
  try {
    const response = await apiClient.get('/bookings/user', { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch user bookings:", error.response?.data?.message || error.message);
    return []; // Return an empty array on error to prevent frontend crashes
  }
}

/**
 * Fetches all bookings for the services of the currently authenticated provider.
 * @returns An array of booking objects.
 */
export async function getProviderBookings(): Promise<Booking[]> {
  try {
    const response = await apiClient.get('/bookings/provider', { headers: getAuthHeaders() });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch provider bookings:", error.response?.data?.message || error.message);
    return []; // Return an empty array on error
  }
}

/**
 * Fetches unavailable time slots for a given service on a specific date.
 * @param serviceId The ID of the service.
 * @param date The date to check for availability.
 * @returns An array of unavailable time slot strings.
 */


/**
 * Allows a user to cancel a booking they have made.
 * @param bookingId The ID of the booking to cancel.
 * @param feePaid A boolean indicating if a cancellation fee was paid.
 * @returns An object indicating success or an error.
 */
export async function cancelBookingAsUser(bookingId: string, feePaid: boolean = false) {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/cancel-user`, { feePaid }, { headers: getAuthHeaders() });
    revalidatePath('/bookings');
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Failed to cancel booking.' };
  }
}

// --- Provider-specific actions ---

/**
 * Allows a provider to accept a pending booking request.
 * @param bookingId The ID of the booking to accept.
 * @returns The updated booking object or an error object.
 */
export async function acceptBooking(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/accept`, {}, { headers: getAuthHeaders() });
    revalidatePath('/dashboard/my-services');
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Failed to accept booking.' };
  }
}

/**
 * Allows a provider to decline a pending booking request.
 * @param bookingId The ID of the booking to decline.
 * @param reason The reason for declining.
 * @returns The updated booking object or an error object.
 */
export async function declineBooking(bookingId: string, reason: string) {
    try {
        const response = await apiClient.put(`/bookings/${bookingId}/decline`, { reason }, { headers: getAuthHeaders() });
        revalidatePath('/dashboard/my-services');
        return response.data;
    } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to decline booking.' };
    }
}

/**
 * Allows a provider to mark a booking as "in-progress".
 * @param bookingId The ID of the booking to start.
 * @returns The updated booking object or an error object.
 */
export async function startBooking(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/start`, {}, { headers: getAuthHeaders() });
    revalidatePath('/dashboard/my-services');
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Failed to start booking.' };
  }
}

/**
 * Allows a provider to complete a booking using a verification code.
 * @param bookingId The ID of the booking to complete.
 * @param verificationCode The code provided by the user.
 * @returns The updated booking object or an error object.
 */
export async function completeBooking(bookingId: string, verificationCode: string) {
    try {
        const response = await apiClient.put(`/bookings/${bookingId}/complete`, { verificationCode }, { headers: getAuthHeaders() });
        revalidatePath('/dashboard/my-services');
        return response.data;
    } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to complete booking.' };
    }
}

/**
 * Allows a provider to mark a booking as incomplete.
 * @param bookingId The ID of the booking.
 * @param reason The reason for marking it as incomplete.
 * @returns The updated booking object or an error object.
 */
export async function markAsIncomplete(bookingId: string, reason: string) {
    try {
        const response = await apiClient.put(`/bookings/${bookingId}/incomplete`, { reason }, { headers: getAuthHeaders() });
        revalidatePath('/dashboard/my-services');
        return response.data;
    } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to mark booking as incomplete.' };
    }
}


export const getUnavailableSlots = async (serviceId: string, date: Date): Promise<string[]> => {
    try {
        const response = await apiClient.get('/bookings/unavailable-slots', {
            params: { serviceId, date: date.toISOString() }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch unavailable slots:", error);
        return [];
    }
};

