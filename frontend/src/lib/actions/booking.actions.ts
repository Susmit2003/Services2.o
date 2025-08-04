// frontend/src/lib/actions/booking.actions.ts
'use server';

import apiClient from '../api';

/**
 * Creates a new booking for a service.
 * @param bookingData The data required for the booking.
 * @returns The newly created booking object.
 */
export async function createBooking(bookingData: any) {
  try {
    const response = await apiClient.post('/bookings/create', bookingData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Your booking could not be completed.');
  }
}

/**
 * Fetches all bookings made by the currently authenticated user.
 * @returns A list of the user's bookings.
 */
export async function getUserBookings() {
  try {
    const response = await apiClient.get('/bookings/user');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch your bookings.');
  }
}

/**
 * Fetches all bookings for services provided by the current user.
 * @returns A list of the provider's bookings.
 */
export async function getProviderBookings() {
  try {
    const response = await apiClient.get('/bookings/provider');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch provider bookings.');
  }
}

/**
 * Updates the status of a booking.
 * @param bookingId The ID of the booking to update.
 * @param status The new status.
 * @returns Success message.
 */
export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update booking status.');
  }
}

/**
 * Gets unavailable time slots for a service on a specific date.
 * @param serviceId The ID of the service.
 * @param date The date to check.
 * @returns Array of unavailable time slots.
 */
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
 * Accepts a booking (provider action).
 * @param bookingId The ID of the booking to accept.
 * @returns Success message.
 */
export async function acceptBooking(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'confirmed' });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to accept booking.');
  }
}

/**
 * Declines a booking (provider action).
 * @param bookingId The ID of the booking to decline.
 * @returns Success message.
 */
export async function declineBooking(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'rejected' });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to decline booking.');
  }
}

/**
 * Marks a booking as in progress (provider action).
 * @param bookingId The ID of the booking to mark as in progress.
 * @returns Success message.
 */
export async function markAsInProgress(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'in-progress' });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark booking as in progress.');
  }
}

/**
 * Completes a booking (provider action).
 * @param bookingId The ID of the booking to complete.
 * @returns Success message.
 */
export async function completeBooking(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'completed' });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to complete booking.');
  }
}

/**
 * Cancels a booking (user action).
 * @param bookingId The ID of the booking to cancel.
 * @returns Success message.
 */
export async function cancelBooking(bookingId: string) {
  try {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel booking.');
  }
}