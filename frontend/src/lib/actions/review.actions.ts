// frontend/src/lib/actions/review.actions.ts
'use server';

import apiClient from '../api';

/**
 * Adds a new review for a specified service.
 * @param reviewData The review content, including serviceId, rating, and comment.
 * @returns The newly created review object.
 */
export async function addReview(reviewData: {
  serviceId: string;
  rating: number;
  comment: string;
}) {
  try {
    const response = await apiClient.post('/reviews/add', reviewData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to submit your review.');
  }
}

/**
 * Fetches all reviews associated with a specific service.
 * @param serviceId The ID of the service whose reviews are to be fetched.
 * @returns A list of reviews for the service.
 */
export async function getReviewsForService(serviceId: string) {
  try {
    const response = await apiClient.get(`/reviews/${serviceId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reviews for this service.');
  }
}

/**
 * Fetches all reviews written by the current user.
 * @returns A list of the user's reviews.
 */
export async function getUserReviews() {
  try {
    const response = await apiClient.get('/reviews/user/my-reviews');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch your reviews.');
  }
}

/**
 * Updates an existing review.
 * @param reviewId The ID of the review to update.
 * @param reviewData The updated review data.
 * @returns The updated review object.
 */
export async function updateReview(reviewId: string, reviewData: {
  rating?: number;
  comment?: string;
}) {
  try {
    const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update review.');
  }
}

/**
 * Deletes a review.
 * @param reviewId The ID of the review to delete.
 * @returns Success message.
 */
export async function deleteReview(reviewId: string) {
  try {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete review.');
  }
}