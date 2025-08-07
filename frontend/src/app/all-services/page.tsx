import { ServicesPageClient } from '@/components/custom/services-page-client';
import { getAllServices } from '@/lib/actions/service.actions';
import type { Service } from '@/types'; // ServiceCategory is no longer needed here

// This is a Server Component that fetches data based on URL query parameters
export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {

  // Parse filters from the URL search parameters
  const filters = {
    category: (searchParams?.category as string) || '',
    subcategory: (searchParams?.subcategory as string) || '',
    searchTerm: (searchParams?.searchTerm as string) || '',
    pincode: (searchParams?.pincode as string) || '',
    rating: (searchParams?.rating as string) || '',
  };

  let initialServices: Service[] = [];
  
  try {
    // --- FIX: Fetch only the services, not the categories ---
    // The backend still sends categories, but we'll just ignore them here.
    const { services } = await getAllServices(filters);
    initialServices = services;
  } catch (error) {
    console.error("Failed to fetch services:", error);
    initialServices = [];
  }

  // --- FIX: Remove the 'categories' prop from the component ---
  // Pass only the necessary data to the client component.
  return (
    <ServicesPageClient
      initialServices={initialServices}
      initialFilters={filters}
    />
  );
}