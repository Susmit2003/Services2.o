import { getUserBookings } from "@/lib/actions/booking.actions";
import { UserBookingCard } from "@/components/custom/user-booking-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import type { Booking } from "@/types";

// --- THIS IS THE FIX ---
// Added the missing 'export default' statement.
export default async function MyBookingsPage() {
    let bookings: Booking[] = [];
    try {
        bookings = await getUserBookings();
    } catch (error) {
        console.error("Failed to fetch user bookings:", error);
    }

    if (bookings.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="text-center w-full max-w-lg p-8">
                    <CardHeader>
                        <ClipboardList className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                        <CardTitle className="font-headline text-2xl">You Have No Bookings</CardTitle>
                        <CardDescription>
                            Your requested, scheduled, and completed services will appear here.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8"> 
            <header>
                <h1 className="font-headline text-4xl font-bold">My Bookings</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Track the status of your service requests and view your booking history.
                </p>
            </header>
            
            <div className="flex flex-col gap-6">
                {bookings.map((booking) => (
                    <UserBookingCard key={booking.id} booking={booking} />
                ))}
            </div>
        </div>
    );
}