import { getProviderBookings } from "@/lib/actions/booking.actions";
import { getUserProfile } from "@/lib/actions/user.actions"; // Import the user action
import { ProviderBookingCard } from "@/components/custom/provider-booking-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarOff } from "lucide-react";
import type { Booking, UserProfile } from "@/types";
import { redirect } from "next/navigation";
export const dynamic = 'force-dynamic';
export default async function ProviderSchedulePage() {
    let bookings: Booking[] = [];
    let user: UserProfile | null = null;

    try {
        // --- THIS IS THE FIX ---
        // We now fetch both the bookings and the user's profile data on the server.
        // This ensures the data is always fresh before the page renders.
        [bookings, user] = await Promise.all([
            getProviderBookings(),
            getUserProfile()
        ]);
    } catch (error) {
        // If fetching fails, the user is not logged in. Redirect them.
        console.error("Failed to fetch provider data, redirecting to login:", error);
        redirect('/login');
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
                    <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                    <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
                    <TabsTrigger value="completed">History ({completed.length})</TabsTrigger>
                </TabsList>
                
                {/* We now pass the 'user' object as a prop to each card */}
                <TabsContent value="pending" className="mt-6">
                    {pending.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {pending.map((booking) => ( <ProviderBookingCard key={booking.id} booking={booking} user={user} /> ))}
                        </div>
                    ) : ( <EmptyState title="No Pending Requests" /> )}
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                     {active.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {active.map((booking) => ( <ProviderBookingCard key={booking.id} booking={booking} user={user} /> ))}
                        </div>
                    ) : ( <EmptyState title="No Active Bookings" /> )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    {completed.length > 0 ? (
                        <div className="flex flex-col gap-6">
                            {completed.map((booking) => ( <ProviderBookingCard key={booking.id} booking={booking} user={user} /> ))}
                        </div>
                    ) : ( <EmptyState title="No Completed Bookings" /> )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

const EmptyState = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-full py-16">
        <Card className="text-center w-full max-w-lg p-8">
            <CardHeader>
                <CalendarOff className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <CardTitle className="font-headline text-2xl">{title}</CardTitle>
            </CardHeader>
        </Card>
    </div>
);