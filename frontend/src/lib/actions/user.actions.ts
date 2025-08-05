'use server';

import apiClient from '../api';
import type { LoginData, SignupData, UserProfile } from '@/types';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Registers a new user by calling the backend API.
 * @param signupData The user's registration details (name, email, password, mobile).
 * @returns The new user's profile and JWT token upon successful registration.
 * @throws An error with a specific message from the backend if signup fails.
 */
export async function signupUser(signupData: SignupData) {
  try {
    const response = await apiClient.post('/users/register', signupData);
    return response.data;
  } catch (error: any) {
    // Extract the specific error message from the backend's response if it exists.
    const errorMessage = error.response?.data?.message || 'A server error occurred during signup. Please try again later.';
    console.error("Signup Action Error:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Logs in an existing user by calling the backend API.
 * @param loginData The user's login credentials (email, password).
 * @returns The user's profile and JWT token upon successful login.
 * @throws An error with a specific message from the backend if login fails.
 */
export async function loginUser(loginData: LoginData) {
  try {
    const response = await apiClient.post('/users/login', loginData);
    return response.data;
  } catch (error: any) {
    // Extract the specific error message from the backend's response.
    const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
    console.error("Login Action Error:", errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Fetches the profile of the currently authenticated user.
 * This function relies on the `apiClient` to have the auth token.
 * @returns The user's profile.
 * @throws An error if the profile fetch fails.
 */
export async function getUserProfile(): Promise<UserProfile> {
    try {
        // --- FIX: Read token from cookies ---
        const token = cookies().get('authToken')?.value;
        if (!token) {
            throw new Error('Not authorized, no token');
        }

        const response = await apiClient.get('/users/profile', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch user profile.';
        throw new Error(errorMessage);
    }
}
/**
 * Updates the profile of the currently authenticated user.
 * @param profileData The data to update.
 * @returns The updated user profile.
 * @throws An error if the update fails.
 */
export async function updateUserProfile(profileData: Partial<UserProfile>) {
    try {
        // --- FIX: Read token from cookies ---
        const token = cookies().get('authToken')?.value;
        if (!token) {
            throw new Error('Not authorized, no token');
        }

        const response = await apiClient.put('/users/profile', profileData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        revalidatePath('/profile');
        revalidatePath('/dashboard');
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to update profile.';
        throw new Error(errorMessage);
    }
}

/**
 * Logs out the user. In a real-world application, this might also call a backend
 * endpoint to invalidate the token on the server side.
 * @returns A success object.
 */
export async function logoutUser() {
    console.log("User logged out from the frontend action.");
    // In a real app, you might call a backend endpoint like:
    // await apiClient.post('/users/logout');
    return { success: true, message: "Logged out successfully." };
}

/**
 * Placeholder function to handle a "forgot password" request.
 * In a real application, this would trigger an email to be sent to the user.
 * @param email The user's email address.
 * @returns A success object with a user-friendly message.
 */
export async function forgotPassword(email: string) {
    console.log(`Password reset requested for: ${email}`);
    // In a real app, you would call a backend endpoint:
    // const response = await apiClient.post('/users/forgot-password', { email });
    // return response.data;
    
    // For now, we simulate a successful response to prevent frontend errors.
    return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
}