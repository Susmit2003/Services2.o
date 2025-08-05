// frontend/src/lib/actions/review.actions.ts
'use server';

import apiClient from '../api';
import { revalidatePath } from 'next/cache';
import type { Review } from '@/types';

/**
 * Adds a new review for a specified service.
 * @param reviewData The review content, including bookingId, rating, and reviewText.
 * @returns An object containing the updated booking and the new review.
 */
export async function addReview(reviewData: {
  bookingId: string;
  rating: number;
  reviewText: string;
}) {
  try {
    const payload = {
      bookingId: reviewData.bookingId,
      rating: reviewData.rating,
      comment: reviewData.reviewText,
    };
    const response = await apiClient.post('/reviews/add', payload);
    
    // Revalidate the pages where the booking is displayed
    revalidatePath('/bookings');
    revalidatePath('/dashboard');

    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Failed to submit your review.' };
  }
}

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