"use server";

import apiClient from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth/utils";
import { Transaction } from "@/types";

/**
 * Fetches the wallet transaction history for the authenticated user.
 * @returns A promise that resolves to an array of transactions.
 */
export async function getWalletTransactions(): Promise<Transaction[]> {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      throw new Error("User is not authenticated.");
    }
    
    // The backend route for transactions is /api/wallet/transactions
    const { data } = await apiClient.get<Transaction[]>("/wallet/transactions", { headers });
    return data;
  } catch (error: any) {
    console.error("Failed to fetch wallet transactions:", error.message);
    // Return an empty array or re-throw the error based on how you want to handle it
    return [];
  }
}