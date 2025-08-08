"use client";

import type { Booking } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MapPin, Loader2, Phone, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cancelBookingAsUser } from '@/lib/actions/booking.actions';
import { FormattedDate } from './FormattedDate';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CANCELLATION_FEE } from '@/lib/constants';

interface UserBookingCardProps {
    booking: Booking;
}

export function UserBookingCard({ booking }: UserBookingCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'in-progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'incompleted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
            case 'cancelled':
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const handleCancelBooking = async () => {
        setIsLoading(true);
        try {
            // We pass 'true' assuming the user agrees to the fee by clicking the confirm button.
            await cancelBookingAsUser(booking.id, true);
            toast({ title: "Booking Cancelled", description: "Your booking has been successfully cancelled." });
            router.refresh();
        } catch (error: any) {
            toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg overflow-hidden w-full">
            <CardHeader className="p-4 md:p-6">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="font-headline text-xl md:text-2xl">{booking.serviceTitle}</CardTitle>
                    <Badge className={`text-xs capitalize px-3 py-1 self-start ${getStatusColor(booking.status)}`}>{booking.status.replace('-', ' ')}</Badge>
                </div>
                <CardDescription className="text-sm mt-1">
                    Provider: {booking.providerName}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex flex-col gap-4">
                 <div className="space-y-1">
                    <p className="flex items-center text-sm"><CalendarDays className="h-4 w-4 mr-2" /> Date: <FormattedDate date={booking.bookingDate} /></p>
                    <p className="flex items-center text-sm"><Clock className="h-4 w-4 mr-2" /> Time: {booking.timeSlot.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1">
                     <p className="flex items-start text-sm"><MapPin className="h-4 w-4 mr-2 mt-0.5" /> Address: {booking.address.line1}, {booking.address.city}</p>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 md:p-6 flex justify-between items-center gap-3">
                 <Button variant="ghost" size="sm"><Phone className="mr-2 h-4 w-4" /> Contact Provider</Button>
                 {booking.status === 'confirmed' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                Cancel Booking
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    A cancellation fee of ₹{CANCELLATION_FEE.toFixed(2)} will be deducted from your wallet. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Back</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancelBooking} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Yes, Cancel Booking"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 )}
            </CardFooter>
        </Card>
    );
}