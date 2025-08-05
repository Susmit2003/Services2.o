// frontend/src/lib/actions/razorpay.actions.ts
'use server';

import apiClient from '../api';
import { getUserProfile } from './user.actions';

/**
 * Creates a Razorpay order for wallet top-up or other payments.
 * @param amount The amount for the order in the smallest currency unit (e.g., paisa for INR).
 * @param bookingId Optional booking ID for context.
 * @returns The order details from Razorpay and the API key.
 */
export async function createRazorpayOrder(amount: number, bookingId?: string) {
  try {
    const user = await getUserProfile();
    if (!user) throw new Error("User not authenticated");
    
    const response = await apiClient.post('/razorpay/create-order', { 
      amount, 
      currency: user.currency || 'INR',
      receipt: `receipt_${bookingId || `wallet_${user.id}_${Date.now()}`}`,
      notes: { bookingId: bookingId || 'wallet_top_up', userId: user.id }
    });
    return { ...response.data, user: { name: user.name, contact: user.mobile } };
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Failed to create Razorpay order.' };
  }
}

/**
 * Verifies a successful Razorpay payment with the backend.
 * @param paymentData The payment details from Razorpay.
 * @returns Success or error message.
 */
export async function verifyTopUpPayment(paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const response = await apiClient.post('/razorpay/verify-payment', paymentData);
    return response.data;
  } catch (error: any) {
     return { error: error.response?.data?.message || 'Payment verification failed.' };
  }
}