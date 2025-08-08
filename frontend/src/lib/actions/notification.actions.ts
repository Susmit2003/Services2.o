'use server';

import apiClient from "@/lib/api";
import { cookies } from "next/headers";
import type { Notification } from "@/types";

// Helper to get auth headers on the server
const getAuthHeaders = () => {
    const token = cookies().get('authToken')?.value;
    if (!token) {
        throw new Error("You must be logged in to view notifications.");
    }
    return { Authorization: `Bearer ${token}` };
};

/**
 * @desc    Fetches all notifications for the currently logged-in user.
 * @returns An array of Notification objects.
 */
export async function getNotifications(): Promise<Notification[]> {
    try {
        // This route should match your backend: GET /api/notifications
        const response = await apiClient.get('/notifications', { headers: getAuthHeaders() });
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch notifications:", error.message);
        return []; // Return an empty array on error to prevent the page from crashing
    }
}

/**
 * @desc    Marks all of a user's unread notifications as read.
 * @returns A success message.
 */
export async function markAllNotificationsAsRead() {
 try {
   const response = await apiClient.post('/notifications/mark-all-read', {}, { headers: getAuthHeaders() });
   return response.data;
 } catch (error: any) {
   throw new Error(error.response?.data?.message || 'Failed to mark notifications as read.');
 }
}