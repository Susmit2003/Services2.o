import { getProviderServices } from '@/lib/actions/service.actions';
import { MyServicesClient } from './my-services-client'; // We will create this next
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Service } from '@/types';

// This Server Component fetches the data before the page loads.
export default async function MyServicesPage() {
    
    let services: Service[] = [];
    try {
        // Fetch the services created by this provider
        services = await getProviderServices();
    } catch (error) {
        console.error("Failed to fetch provider services:", error);
        // If there's an error (e.g., user not logged in), services will be an empty array.
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">My Services</h1>
                <p className="text-muted-foreground">View, edit, and manage all the services you offer.</p>
            </div>

            {/* We pass the server-fetched data to a Client Component for interactivity */}
            <MyServicesClient initialServices={services} />
        </div>
    );
}