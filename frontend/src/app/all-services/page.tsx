import { ServicesPageClient } from '@/components/custom/services-page-client';
import { getAllServices } from '@/lib/actions/service.actions'; // <-- Correct import
import { serviceHierarchy } from '@/lib/constants';
import type { Service, ServiceCategory } from '@/types';

// This is a Server Component, so it's async
export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {

  // Parse filters from the URL search parameters
  const filters = {
    category: searchParams?.category as string || '',
    subcategory: searchParams?.subcategory as string || '',
    searchTerm: searchParams?.searchTerm as string || '',
    pincode: searchParams?.pincode as string || '',
    rating: searchParams?.rating as string || '',
  };

  let initialServices: Service[] = [];
  let initialCategories: ServiceCategory[] = [];
  let isLoading = true;

  try {
    // --- FIX: Call the correct function name 'getAllServices' ---
    const { services, categories } = await getAllServices(filters);
    initialServices = services;
    initialCategories = categories;
  } catch (error) {
    console.error("Failed to fetch initial services:", error);
    // On error, we pass empty arrays to the client component to prevent crashes.
    initialServices = [];
    initialCategories = [];
  } finally {
    isLoading = false;
  }

  // The client component handles all interactivity (filtering, sorting, etc.)
  return (
    <ServicesPageClient
      initialServices={initialServices}
      initialFilters={filters}
      categories={initialCategories}
      isLoading={isLoading}
    />
  );
}