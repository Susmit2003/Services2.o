import { getProviderServices } from "@/lib/actions/service.actions";
// --- THIS IS THE FIX ---
// Changed from a named import { MyServicesClient } to a default import.
import MyServicesClient from "./my-services-client"; 
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import type { Service } from "@/types";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
export const dynamic = 'force-dynamic';
// This is a Server Component that fetches its own data.
export default async function MyServicesPage() {
    let services: Service[] = [];
    try {
        services = await getProviderServices();
    } catch (error) {
        console.error("Failed to fetch provider services:", error);
    }

    if (services.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="text-center w-full max-w-lg p-8">
                    <CardHeader>
                        <PlusCircle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                        <CardTitle className="font-headline text-2xl">You Haven't Created Any Services Yet</CardTitle>
                        <CardDescription>
                            Click below to add your first service and start connecting with customers.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                         <Link href="/dashboard/my-services/add">
                            <Button size="lg">Add Your First Service</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8"> 
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-4xl font-bold">My Services</h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Here are the services you currently offer.
                    </p>
                </div>
                <Link href="/dashboard/my-services/add">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Service
                    </Button>
                </Link>
            </header>
            
            {/* The client component is now correctly imported and rendered */}
            <MyServicesClient services={services} />
        </div>
    );
}