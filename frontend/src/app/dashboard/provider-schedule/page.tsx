import { getProviderBookings } from "@/lib/actions/booking.actions";
import { ProviderBookingCard } from "@/components/custom/provider-booking-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarOff } from "lucide-react";
import type { Booking } from "@/types";

export default async function ProviderSchedulePage() {
    let bookings: Booking[] = [];
    try {
        bookings = await getProviderBookings();
    } catch (error) {
        console.error("Failed to fetch provider bookings:", error);
    }

    const pending = bookings.filter(b => b.status === 'pending');
    const active = bookings.filter(b => b.status === 'confirmed' || b.status === 'in-progress');
    const completed = bookings.filter(b => b.status === 'completed' || b.status === 'incompleted' || b.status === 'rejected' || b.status === 'cancelled');

    return (
        <div className="space-y-8"> 
            <header>
                <h1 className="font-headline text-4xl font-bold">Your Booking Schedule</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Manage your incoming service requests and view your appointments.
                </p>
            </header>
            
            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">Pending Requests ({pending.length})</TabsTrigger>
                    <TabsTrigger value="active">Active & Upcoming ({active.length})</TabsTrigger>
                    <TabsTrigger value="completed">History ({completed.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="mt-6">
                    {pending.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {pending.map((booking) => ( <ProviderBookingCard key={booking.id} booking={booking} /> ))}
                        </div>
                    ) : (
                        <EmptyState title="No Pending Requests" description="New booking requests from customers will appear here." />
                    )}
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                    {active.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {active.map((booking) => ( <ProviderBookingCard key={booking.id} booking={booking} /> ))}
                        </div>
                    ) : (
                        <EmptyState title="No Active Bookings" description="Accepted bookings and services in progress will be shown here." />
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    {completed.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {completed.map((booking) => ( <ProviderBookingCard key={booking.id} booking={booking} /> ))}
                        </div>
                    ) : (
                        <EmptyState title="No Completed Bookings" description="Your past services will be listed here." />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Helper component for empty states
const EmptyState = ({ title, description }: { title: string, description: string }) => (
    <div className="flex items-center justify-center h-full py-16">
        <Card className="text-center w-full max-w-lg p-8">
            <CardHeader>
                <CalendarOff className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
        </Card>
    </div>
);