'use server';

import apiClient from '../api'; // Using the central API client

/**
 * Fetches all notifications for the currently authenticated user.
 * @returns A list of the user's notifications.
 */
export async function getUserNotifications() {
  try {
    const response = await apiClient.get('/notifications');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications.');
  }
}

/**
 * Marks all of a user's unread notifications as read.
 * @returns A success message.
 */
export async function markAllNotificationsAsRead() {
  try {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark notifications as read.');
  }
}
