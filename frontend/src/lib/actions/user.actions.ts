'use server';

import apiClient from '../api';
import { z } from 'zod';
import { loginSchema, signupSchema } from '../validations';

// Signup
export async function signupUser(data: z.infer<typeof signupSchema>) {
  try {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
  }
}

// Login
export async function loginUser(data: z.infer<typeof loginSchema>) {
  try {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials and try again.');
  }
}

// Forgot Password
export async function forgotPassword(mobile: string) {
  try {
    const response = await apiClient.post('/auth/forgot-password', { mobile });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to process forgot password request.');
  }
}

/**
 * Fetches the profile of the currently authenticated user.
 *
 * NOTE: This function assumes that the `apiClient` is configured to send
 * the JWT token with its request headers. You would typically use an "interceptor"
 * to grab the token from localStorage or a cookie and add it to every request.
 *
 * @returns The user's profile data.
 */
export async function getUserProfile() {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error: any) {
    // This is useful for automatically logging out a user if their token is expired.
    throw new Error(error.response?.data?.message || 'Could not fetch user profile. You may need to log in again.');
  }
}

/**
 * Updates a user's profile information.
 *
 * @param userId - The ID of the user to update.
 * @param updateData - The data fields to update.
 * @returns The updated user object.
 */
export async function updateUserProfile(userId: string, updateData: any) {
  try {
    const response = await apiClient.put(`/users/profile/${userId}`, updateData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update profile.');
  }
}

/**
 * Changes the user's password.
 *
 * @param currentPassword - The current password.
 * @param newPassword - The new password.
 * @returns Success message.
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const response = await apiClient.post('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to change password.');
  }
}

/**
 * Deletes the user's account.
 *
 * @returns Success message.
 */
export async function deleteAccount() {
  try {
    const response = await apiClient.delete('/users/account');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete account.');
  }
}

/**
 * Logs out the current user by removing the token from localStorage.
 * Optionally calls the backend to invalidate the token.
 *
 * @returns Success message.
 */
export async function logoutUser() {
  // Remove token from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
  
  // Optionally, you could call a backend endpoint to invalidate the token
  // try {
  //   await apiClient.post('/auth/logout');
  // } catch (error) {
  //   console.error('Failed to logout on server:', error);
  // }
  
  return { message: 'Logged out successfully' };
}