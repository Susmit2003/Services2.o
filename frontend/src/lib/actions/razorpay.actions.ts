'use server';

import apiClient from '../api';
import { cookies } from 'next/headers';

// This helper correctly gets the auth token on the server
const getAuthHeaders = () => {
    const token = cookies().get('authToken')?.value;
    if (!token) {
        throw new Error("You must be logged in to perform this action.");
    }
    return { Authorization: `Bearer ${token}` };
};

export async function createRazorpayOrder(amount: number) {
  try {
    const response = await apiClient.post(
      '/razorpay/create-order', 
      { amount },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create order.');
  }
}

export async function verifyTopUpPayment(paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const response = await apiClient.post(
        '/razorpay/verify-payment', 
        paymentData,
        { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment verification failed.');
  }
}