"use client";

import type { Booking } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CalendarDays, Clock, MapPin, Loader2, Phone, XCircle, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cancelBookingAsUser } from '@/lib/actions/booking.actions';
import { addReview } from '@/lib/actions/review.actions'; // <-- FIX: Correct import path
import { FormattedDate } from './FormattedDate';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'; // <-- FIX: Added DialogDescription
import { CANCELLATION_FEE } from '@/lib/constants';
import { RatingStars } from './rating-stars';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ChatModal } from './chat-modal';
import { useAuth } from '@/context/auth-context';

interface UserBookingCardProps {
    booking: Booking;
}

export function UserBookingCard({ booking }: UserBookingCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false); 
    const { currentUser } = useAuth(); 

        const handleContactClick = () => {
        // DEBUG STEP 1: Check if the click event fires
        console.log("Contact Provider button clicked!");
        // DEBUG STEP 2: Check if the state update is called
        setIsChatOpen(true);
    };

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
            await cancelBookingAsUser(booking.id, true);
            toast({ title: "Booking Cancelled" });
            router.refresh();
        } catch (error: any) {
            toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };


        const handleFeedbackSubmit = async () => {
        if (rating === 0) {
            toast({ title: "Please select a rating.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            await addReview({
                bookingId: booking.id,
                rating: rating,
                comment: reviewText,
            });
            toast({ title: "Feedback Submitted!", description: "Thank you for your review." });
            setIsFeedbackDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

     return (
        <>
        <Card className="shadow-lg overflow-hidden w-full">
            <CardHeader className="p-4 md:p-6">
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-xl">{booking.serviceTitle}</CardTitle>
                    <Badge className={`capitalize ${getStatusColor(booking.status)}`}>{booking.status.replace('-', ' ')}</Badge>
                </div>
                <CardDescription>Provider: {booking.providerName}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
                 <div className="space-y-1">
                    <p className="flex items-center"><CalendarDays className="h-4 w-4 mr-2" /> Date: <FormattedDate date={booking.bookingDate} /></p>
                    <p className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Time: {booking.timeSlot.replace(/_/g, ' ')}</p>
                    <p className="flex items-start"><MapPin className="h-4 w-4 mr-2 mt-0.5" /> Address: {booking.address.line1}, {booking.address.city}</p>
                </div>

                {booking.status === 'confirmed' && booking.serviceVerificationCode && (
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold flex items-center mb-2"><KeyRound className="h-4 w-4 mr-2"/> Your Service OTP</h4>
                        <p className="text-muted-foreground text-sm">Share this code with the provider only when the service is complete.</p>
                        <div className="mt-2 text-2xl font-bold tracking-widest text-center bg-muted p-3 rounded-lg">
                            {booking.serviceVerificationCode}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 flex justify-between items-center">
                 <Button variant="ghost" size="sm" onClick={handleContactClick}>
                        <Phone className="mr-2 h-4 w-4" /> Contact Provider
                    </Button>
                 
                 <div>
                    {booking.status === 'confirmed' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}Cancel Booking</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>A cancellation fee of ₹{CANCELLATION_FEE.toFixed(2)} will be deducted from your wallet.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Back</AlertDialogCancel><AlertDialogAction onClick={handleCancelBooking} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Yes, Cancel"}</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {booking.status === 'completed' && !booking.userFeedback && (
                        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
                            <DialogTrigger asChild><Button><Star className="mr-2 h-4 w-4" /> Leave Feedback</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Rate Your Experience</DialogTitle><DialogDescription>Provide feedback for {booking.providerName}.</DialogDescription></DialogHeader>
                                <div className="py-4 space-y-4">
                                    <div><Label className="text-center block mb-2">Your Rating</Label><div className="flex justify-center"><RatingStars rating={rating} onRatingChange={setRating} interactive size={32} /></div></div>
                                    <div><Label htmlFor="reviewText">Comments (Optional)</Label><Textarea id="reviewText" value={reviewText} onChange={(e) => setReviewText(e.target.value)} /></div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                    <Button onClick={handleFeedbackSubmit} disabled={isLoading || rating === 0}>{isLoading ? <Loader2 className="animate-spin" /> : "Submit"}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {booking.status === 'completed' && booking.userFeedback && (
                        <p className="text-sm text-muted-foreground">Feedback Submitted</p>
                    )}
                 </div>
            </CardFooter>
        </Card>

         {currentUser && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    booking={booking}
                    otherUser={{
                        id: booking.providerId,
                        name: booking.providerName,
                        profileImage: booking.providerImage,
                    }}
                />
            )}
        </>
    );
}