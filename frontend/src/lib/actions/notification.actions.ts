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
        // This now correctly calls GET /api/notifications, which will work
        // after you rename the backend route file.
        const response = await apiClient.get('/notifications', { headers: getAuthHeaders() });
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch notifications:", error.message);
        return [];
    }
}

export async function markAllNotificationsAsRead() {
 try {
   await apiClient.post('/notifications/mark-all-read', {}, { headers: getAuthHeaders() });
 } catch (error: any) {
   throw new Error('Failed to mark notifications as read.');
 }
}