// frontend/src/lib/actions/service.actions.ts
'use server';

import apiClient from '../api';

/**
 * Fetches all available services from the backend with optional filtering.
 * @param filters Optional filters for category, subcategory, search, etc.
 * @returns A list of services.
 */
export async function getServices(filters?: {
  category?: string;
  subcategory?: string;
  search?: string;
  pincode?: string;
  rating?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await apiClient.get(`/services?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch services.');
  }
}

/**
 * Fetches all available services from the backend.
 * @returns A list of services.
 */
export async function getAllServices() {
  try {
    const response = await apiClient.get('/services');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch services.');
  }
}

/**
 * Fetches a single service by its unique ID.
 * @param serviceId The ID of the service to fetch.
 * @returns The detailed service object.
 */
export async function getServiceById(serviceId: string) {
  try {
    const response = await apiClient.get(`/services/${serviceId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service details.');
  }
}

/**
 * Fetches services created by the current provider.
 * @returns A list of the provider's services.
 */
export async function getProviderServices() {
  try {
    const response = await apiClient.get('/services/provider/my-services');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch your services.');
  }
}

/**
 * Creates a new service by sending data to the backend.
 * @param serviceData The data for the new service.
 * @returns The newly created service object.
 */
export async function createService(serviceData: any) {
  try {
    const response = await apiClient.post('/services/create', serviceData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create the service.');
  }
}

/**
 * Updates an existing service.
 * @param serviceId The ID of the service to update.
 * @param serviceData The updated service data.
 * @returns The updated service object.
 */
export async function updateService(serviceId: string, serviceData: any) {
  try {
    const response = await apiClient.put(`/services/${serviceId}`, serviceData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update the service.');
  }
}

/**
 * Deletes (archives) a service.
 * @param serviceId The ID of the service to delete.
 * @returns Success message.
 */
export async function deleteService(serviceId: string) {
  try {
    const response = await apiClient.delete(`/services/${serviceId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete the service.');
  }
}

/**
 * Updates the status of a service (Active, Inactive, Archived).
 * @param serviceId The ID of the service to update.
 * @param status The new status.
 * @returns The updated service object.
 */
export async function updateServiceStatus(serviceId: string, status: 'Active' | 'Inactive' | 'Archived') {
  try {
    const response = await apiClient.put(`/services/${serviceId}`, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update service status.');
  }
}