'use server';

import apiClient from '../api';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers'; // Import the cookies function
import type { ServiceFormData, Service, ServiceCategory } from '@/types';

// --- FIX: Create a helper function to get auth headers from cookies ---
// This ensures all protected server actions are authenticated correctly.
const getAuthHeaders = () => {
    const token = cookies().get('authToken')?.value;
    if (!token) {
        // This will be caught by the try/catch block in the calling function
        throw new Error('Not authorized, no token found');
    }
    return {
        Authorization: `Bearer ${token}`,
    };
};

/**
 * Fetches all active services, with optional filtering.
 * This is a public action and does not require authentication.
 */
export async function getAllServices(filters: any = {}): Promise<{ services: Service[], categories: ServiceCategory[] }> {
    try {
        const response = await apiClient.get('/services', { params: filters });
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch all services:", error.response?.data?.message || error.message);
        return { services: [], categories: [] };
    }
}

/**
 * Creates a new service listing for the authenticated provider.
 */
export async function createService(serviceData: ServiceFormData) {
    try {
        const response = await apiClient.post('/services/create', serviceData, { headers: getAuthHeaders() });
        revalidatePath('/dashboard/my-services');
        return response.data;
    } catch (error: any) {
        return { error: error.response?.data?.message || 'Failed to create the service.' };
    }
}

/**
 * Fetches all services belonging to the currently authenticated provider.
 */
export async function getProviderServices(): Promise<Service[]> {
    try {
        const response = await apiClient.get('/services/provider/my-services', { headers: getAuthHeaders() });
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch provider services:", error.response?.data?.message || error.message);
        return [];
    }
}

/**
 * Updates the status of a provider's service.
 */
export async function updateServiceStatus(serviceId: string, status: 'Active' | 'Inactive') {
  try {
    const response = await apiClient.patch(`/services/${serviceId}/status`, { status }, { headers: getAuthHeaders() });
    revalidatePath('/dashboard/my-services');
    return { success: true, service: response.data };
  } catch (error: any) {
    // We throw the actual error message to be displayed in the toast
    throw new Error(error.response?.data?.message || 'Failed to update service status.');
  }
}

// ... include any other actions like getServiceById, updateService, archiveService, etc.,
// making sure to add { headers: getAuthHeaders() } to any that require authentication.

export async function getServiceById(serviceId: string) {
  // This is public, so no auth needed
  try {
    const response = await apiClient.get(`/services/${serviceId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service details.');
  }
}

export async function updateService(serviceId: string, serviceData: any) {
  try {
    const response = await apiClient.put(`/services/${serviceId}`, serviceData, { headers: getAuthHeaders() });
    revalidatePath('/dashboard/my-services');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update the service.');
  }
}

export async function archiveService(serviceId: string) {
  try {
    const response = await apiClient.delete(`/services/${serviceId}`, { headers: getAuthHeaders() });
    revalidatePath('/dashboard/my-services');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to archive the service.');
  }
}