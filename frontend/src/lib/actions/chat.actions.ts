'use server';

import apiClient from "@/lib/api";
import { cookies } from "next/headers";
import type { Message } from "@/types";

const getAuthHeaders = () => {
    const token = cookies().get('authToken')?.value;
    if (!token) throw new Error("You must be logged in.");
    return { Authorization: `Bearer ${token}` };
};

export async function getChatHistory(bookingId: string): Promise<Message[]> {
    try {
        const response = await apiClient.get(`/chat/messages/${bookingId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch chat history:", error);
        return [];
    }
}