'use server';

import apiClient from "@/lib/api";
import { cookies } from "next/headers";
import type { Notification } from "@/types";

const getAuthHeaders = () => {
    const token = cookies().get('authToken')?.value;
    if (!token) throw new Error("You must be logged in.");
    return { Authorization: `Bearer ${token}` };
};

export async function getNotifications(): Promise<Notification[]> {
    try {
        const response = await apiClient.get('/notifications', { headers: getAuthHeaders() });
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch notifications:", error.message);
        return [];
    }
}

/**
 * @desc    Marks all of a user's unread notifications as read.
 * @returns A success message.
 */
export async function markAllNotificationsAsRead() {
 try {
   // --- THIS IS THE FIX ---
   // Changed from apiClient.post to apiClient.put to match the backend route.
   await apiClient.put('/notifications/mark-all-read', {}, { headers: getAuthHeaders() });
 } catch (error: any) {
   throw new Error('Failed to mark notifications as read.');
 }
}