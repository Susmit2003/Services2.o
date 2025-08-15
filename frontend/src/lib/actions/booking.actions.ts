'use server';

import apiClient from "@/lib/api";
import { cookies } from "next/headers";
import type { Booking, BookingFormData } from "@/types";

const getAuthHeaders = () => {
    const token = cookies().get('authToken')?.value;
    if (!token) throw new Error("You must be logged in.");
    return { Authorization: `Bearer ${token}` };
};

export const completeService = async (payload: { bookingId: string; verificationCode: string }) => {
    const headers = getAuthHeaders();
    // The body of the request will now contain the verificationCode
    await apiClient.put(`/bookings/${payload.bookingId}/complete`, { verificationCode: payload.verificationCode }, { headers });
};




// Helper to get auth headers on the server


// --- USER ACTIONS ---
export const createBooking = async (payload: BookingFormData) => {
    await apiClient.post("/bookings/create", payload, { headers: getAuthHeaders() });
};

export const cancelBookingAsUser = async (bookingId: string, feePaid: boolean) => {
    await apiClient.post(`/bookings/${bookingId}/cancel-user`, { feePaid }, { headers: getAuthHeaders() });
};

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

// --- PROVIDER ACTIONS ---

export async function getProviderBookings(): Promise<Booking[]> {
    try {
        const response = await apiClient.get('/bookings/provider', { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch provider bookings:", error);
        return [];
    }
}

export const acceptBooking = async (bookingId: string) => {
    await apiClient.put(`/bookings/${bookingId}/accept`, {}, { headers: getAuthHeaders() });
};

export const declineBooking = async (bookingId: string, reason: string) => {
    await apiClient.put(`/bookings/${bookingId}/decline`, { reason }, { headers: getAuthHeaders() });
};

// --- FIX: Add the missing exported functions ---

export const verifyAndStartService = async (payload: { bookingId: string; verificationCode: string }) => {
    await apiClient.put(`/bookings/${payload.bookingId}/start`, { verificationCode: payload.verificationCode }, { headers: getAuthHeaders() });
};


export const addProviderFeedback = async (payload: { bookingId: string; rating: number; reviewText: string }) => {
    await apiClient.post(`/bookings/${payload.bookingId}/provider-feedback`, { rating: payload.rating, reviewText: payload.reviewText }, { headers: getAuthHeaders() });
};

export const markAsIncomplete = async (bookingId: string, reason: string) => {
    await apiClient.put(`/bookings/${bookingId}/incomplete`, { reason }, { headers: getAuthHeaders() });
};


export async function getUserBookings(): Promise<Booking[]> {
    try {
        const response = await apiClient.get('/bookings/user', { headers: getAuthHeaders() });
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch user bookings:", error.message);
        return [];
    }
}
