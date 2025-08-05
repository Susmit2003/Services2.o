// frontend/src/lib/actions/booking.actions.ts
'use server';

import apiClient from '../api';
import { revalidatePath } from 'next/cache';

export async function createBooking(bookingData: any) {
  try {
    const response = await apiClient.post('/bookings/create', bookingData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Your booking could not be completed.');
  }
}

export async function getUserBookings() {
  try {
    const response = await apiClient.get('/bookings/user');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch your bookings.');
  }
}

export async function getProviderBookings() {
  try {
    const response = await apiClient.get('/bookings/provider');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch provider bookings.');
  }
}

export async function getUnavailableSlots(serviceId: string, date: Date) {
  try {
    const dateString = date.toISOString().split('T')[0];
    const response = await apiClient.get(`/bookings/unavailable-slots?serviceId=${serviceId}&date=${dateString}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch unavailable slots.');
  }
}

/**
 * Cancels a booking as a user.
 * @param bookingId The ID of the booking to cancel.
 * @param feePaid Indicates if the cancellation fee was paid.
 * @returns The updated booking object.
 */
export async function cancelBookingAsUser(bookingId: string, feePaid: boolean = false) {
  try {
    const response = await apiClient.post(`/bookings/${bookingId}/cancel-user`, { feePaid });
    revalidatePath('/bookings');
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Failed to cancel booking.' };
  }
}

// Provider actions
export async function acceptBooking(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/accept`);
    revalidatePath('/dashboard');
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Failed to accept booking.' };
  }
}

export async function declineBooking(bookingId: string, reason: string) {
    try {
        const response = await apiClient.put(`/bookings/${bookingId}/decline`, { reason });
        revalidatePath('/dashboard');
        return response.data;
    } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to decline booking.' };
    }
}

export async function startBooking(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/start`);
    revalidatePath('/dashboard');
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Failed to start booking.' };
  }
}

export async function completeBooking(bookingId: string, verificationCode: string) {
    try {
        const response = await apiClient.put(`/bookings/${bookingId}/complete`, { verificationCode });
        revalidatePath('/dashboard');
        return response.data;
    } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to complete booking.' };
    }
}

export async function markAsIncomplete(bookingId: string, reason: string) {
    try {
        const response = await apiClient.put(`/bookings/${bookingId}/incomplete`, { reason });
        revalidatePath('/dashboard');
        return response.data;
    } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to mark booking as incomplete.' };
    }
}