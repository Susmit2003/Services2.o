"use client";

import { useState } from 'react';
import type { Booking, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CalendarDays, Clock, MapPin, MessageSquare, Loader2, Play, CheckCircle, User, Info, Ban, Check, X } from 'lucide-react';
import { RatingStars } from '@/components/custom/rating-stars';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { verifyAndStartService, completeService, addProviderFeedback, acceptBooking, declineBooking, markAsIncomplete } from '@/lib/actions/booking.actions';
import { PROVIDER_PLATFORM_FEE_PERCENTAGE, currencySymbols } from '@/lib/constants';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context'; 
import { FormattedDate } from './FormattedDate';
import { ChatModal } from './chat-modal'; 

// The component now correctly defines that it receives a 'user' prop.
interface ProviderBookingCardProps {
    booking: Booking;
    user: UserProfile;
}

export function ProviderBookingCard({ booking, user }: ProviderBookingCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { currentUser } = useAuth();
    
    // --- THIS IS THE FIX ---
    // We have removed the 'useAuth' hook. This component now relies entirely
    // on the 'user' prop, which is always up-to-date from the server.
    
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const [verificationCode, setVerificationCode] = useState('');
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [declineReason, setDeclineReason] = useState("");
    const [incompleteReason, setIncompleteReason] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false);

    // This logic now uses the reliable 'user' prop.
    const isFreeBooking = user.monthlyFreeBookings > 0;
    const platformFee = (booking.totalPrice || 0) * PROVIDER_PLATFORM_FEE_PERCENTAGE;
    const hasSufficientBalance = user.walletBalance >= platformFee;
    const symbol = currencySymbols[user.currency] || '₹';
     const handleContactClick = () => {
        // DEBUG STEP 1: Check if the click event fires
        console.log("Contact Customer button clicked!");
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
            case 'cancelled': case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const handleAction = async (action: () => Promise<any>, successTitle: string) => {
        setIsLoading(true);
        try {
            await action();
            toast({ title: successTitle });
            router.refresh();
        } catch (error) {
            toast({ title: "Action Failed", description: (error as Error).message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };
    
    const handleStartService = () => handleAction(() => verifyAndStartService({ bookingId: booking.id, verificationCode }), "Service Started!");
  const handleCompleteService = () => handleAction(() => completeService({ bookingId: booking.id, verificationCode }), "Service Completed!");
    const handleSubmitFeedback = () => handleAction(() => addProviderFeedback({ bookingId: booking.id, rating, reviewText }), "Feedback Submitted");
    const handleAcceptBooking = () => handleAction(() => acceptBooking(booking.id), "Booking Accepted");
    
    const handleDeclineBooking = () => {
        if (!declineReason) {
            toast({ title: "Reason Required", variant: "destructive" });
            return;
        }
        handleAction(() => declineBooking(booking.id, declineReason), "Booking Declined");
    };

    const handleMarkAsIncomplete = () => {
        if (!incompleteReason) {
            toast({ title: "Reason Required", variant: "destructive" });
            return;
        }
        handleAction(() => markAsIncomplete(booking.id, incompleteReason), "Service Marked as Incomplete");
    };
    
    const renderActions = () => {
        switch (booking.status) {
            case 'pending':
                const canAccept = isFreeBooking || hasSufficientBalance;
                return (
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                        {!canAccept && (<div className="text-xs text-destructive"><p>Min. {symbol}{platformFee.toFixed(2)} required.</p><Link href="/wallet" className="underline">Top up</Link></div>)}
                        <div className="flex gap-2">
                            <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={isLoading}><X className="mr-2 h-4 w-4"/>Decline</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Decline this booking?</AlertDialogTitle><AlertDialogDescription>Please provide a reason for declining.</AlertDialogDescription></AlertDialogHeader><div className="py-2"><Textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} /></div><AlertDialogFooter><AlertDialogCancel>Back</AlertDialogCancel><AlertDialogAction onClick={handleDeclineBooking} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Confirm Decline"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                            <AlertDialog><AlertDialogTrigger asChild><Button disabled={isLoading || !canAccept}><Check className="mr-2 h-4 w-4"/>Accept</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Accept this booking?</AlertDialogTitle><AlertDialogDescription>{isFreeBooking ? `This is a free acceptance. You have ${user.monthlyFreeBookings} left.` : `A fee of ${symbol}${platformFee.toFixed(2)} will be deducted.`}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleAcceptBooking} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Yes, Accept"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                        </div>
                    </div>
                );
            case 'confirmed':
                return <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button><Play className="mr-2 h-4 w-4" /> Start Service</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Enter Verification Code</DialogTitle><DialogDescription>Ask the customer for their 6-digit code.</DialogDescription></DialogHeader><div className="py-4"><Input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} maxLength={6} /></div><DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleStartService} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Verify & Start"}</Button></DialogFooter></DialogContent></Dialog>;
            case 'in-progress':
                return (
                    <div className="flex gap-2">
                        <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={isLoading}><Ban className="mr-2 h-4 w-4" /> Incomplete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Mark as Incomplete?</AlertDialogTitle><AlertDialogDescription>Please provide a reason.</AlertDialogDescription></AlertDialogHeader><div className="py-2"><Textarea value={incompleteReason} onChange={(e) => setIncompleteReason(e.target.value)} /></div><AlertDialogFooter><AlertDialogCancel>Back</AlertDialogCancel><AlertDialogAction onClick={handleMarkAsIncomplete} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Mark Incomplete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                        <AlertDialog><AlertDialogTrigger asChild><Button disabled={isLoading}><CheckCircle className="mr-2 h-4 w-4" /> Mark as Complete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Complete this service?</AlertDialogTitle><AlertDialogDescription>This allows feedback.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleCompleteService}>{isLoading ? <Loader2 className="animate-spin" /> : "Yes, Complete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                    </div>
                );
            case 'completed':
                return booking.providerFeedback ? (<div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> Feedback Submitted</div>) : (<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button variant="outline"><Star className="mr-2 h-4 w-4" /> Leave Feedback</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Rate Your Experience</DialogTitle><DialogDescription>Provide feedback for {booking.bookedByUserName}.</DialogDescription></DialogHeader><div className="py-4 space-y-4"><div><Label className="text-center">User Rating</Label><div className="flex justify-center"><RatingStars rating={rating} onRatingChange={setRating} interactive size={32} /></div></div><div><Label htmlFor="reviewText">Comments</Label><Textarea id="reviewText" value={reviewText} onChange={(e) => setReviewText(e.target.value)} /></div></div><DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleSubmitFeedback} disabled={isLoading || rating === 0}>{isLoading ? <Loader2 className="animate-spin" /> : "Submit"}</Button></DialogFooter></DialogContent></Dialog>);
            default: return null;
        }
    }

    return (
        <>
        <Card className="shadow-lg w-full">
            <CardHeader className="p-4">
                <div className="flex justify-between items-center"><CardTitle className="font-headline text-xl">{booking.serviceTitle}</CardTitle><Badge className={`capitalize ${getStatusColor(booking.status)}`}>{booking.status.replace('-', ' ')}</Badge></div>
                <CardDescription className="flex items-center pt-1"><User className="h-4 w-4 mr-2" /> Booked by: {booking.bookedByUserName}</CardDescription>
                {booking.status === 'cancelled' && booking.cancelledBy && (<CardDescription className="text-sm text-red-500 flex items-center"><Info className="h-4 w-4 mr-2" /> Cancelled by {booking.cancelledBy} on <FormattedDate date={booking.cancelledAt} /></CardDescription>)}
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
                <div className="space-y-1"><p className="flex items-center text-sm"><CalendarDays className="h-4 w-4 mr-2" /> Date: <FormattedDate date={booking.bookingDate} /></p><p className="flex items-center text-sm"><Clock className="h-4 w-4 mr-2" /> Time: {booking.timeSlot.replace(/_/g, ' ')}</p></div>
                <div className="space-y-1"><p className="flex items-start text-sm"><MapPin className="h-4 w-4 mr-2 mt-0.5" /> Address: {booking.address.line1}, {booking.address.city}, {booking.address.pinCode}</p></div>
                {booking.userFeedback && (<div className="pt-4 border-t"><h4 className="text-sm font-semibold">User's Feedback</h4><RatingStars rating={booking.userFeedback.stars} /><p className="text-sm italic">"{booking.userFeedback.text}"</p></div>)}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={handleContactClick}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Contact Customer
                    </Button>
                 <div>{renderActions()}</div>
            </CardFooter>
        </Card>
                    {/* 5. ADD THE CHAT MODAL COMPONENT */}
           {currentUser && (
                 <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    booking={booking}
                    otherUser={{
                        id: booking.userId,
                        name: booking.bookedByUserName,
                        profileImage: booking.bookedByUserImage,
                    }}
                />
            )}
        </>

    )
}