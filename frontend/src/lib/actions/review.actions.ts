// frontend/src/lib/actions/review.actions.ts
'use server';

import apiClient from '../api';
import { revalidatePath } from 'next/cache';
import { cookies } from "next/headers";
import type { Review } from "@/types";


const getAuthHeaders = () => {
    const token = cookies().get('authToken')?.value;
    if (!token) throw new Error("You must be logged in.");
    return { Authorization: `Bearer ${token}` };
};

// --- THIS IS THE NEW FUNCTION ---
/**
 * @desc    Fetches all reviews for services offered by the logged-in user.
 * @returns An array of Review objects.
 */
export async function getProviderFeedback(): Promise<Review[]> {
    try {
        // This assumes a backend route exists at GET /api/reviews/provider
        const response = await apiClient.get('/reviews/provider', { headers: getAuthHeaders() });
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch provider feedback:", error.message);
        return [];
    }
}

/**
 * Adds a new review for a specified service.
 * @param reviewData The review content, including bookingId, rating, and reviewText.
 * @returns An object containing the updated booking and the new review.
 */




/**
 * Fetches all reviews associated with a specific service.
 * @param serviceId The ID of the service whose reviews are to be fetched.
 * @returns A list of reviews for the service.
 */
export async function getReviewsForService(serviceId: string): Promise<Review[]> {
  try {
    const response = await apiClient.get(`/reviews/${serviceId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch reviews for service:", error);
    return []; // Return an empty array on error
  }
}

// export const addReview = async (payload: { bookingId: string, rating: number, comment: string }) => {
//     // This assumes a backend route exists at POST /api/reviews/add
//     await apiClient.post('/reviews/add', payload, { headers: getAuthHeaders() });
// };



export async function addReview(payload: { bookingId: string, rating: number, comment: string }) {
    try {
        // ✅ FIX 1: The correct backend path is '/reviews'
        const response = await apiClient.post('/reviews', payload, { headers: getAuthHeaders() });
        
        revalidatePath(`/dashboard/my-bookings`); // Revalidate bookings to show feedback status
        
        // ✅ FIX 2: Return the data from the server response
        return response.data; 
    } catch (error: any) {
        // Return an object with an error key, consistent with other actions
        return { error: error.response?.data?.message || error.message };
    }
}

