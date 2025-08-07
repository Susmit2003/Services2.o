"use client";

import { useState, useEffect } from 'react';
import type { Service, UserProfile, BookingFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CalendarClock, Clock, ShieldCheck, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUnavailableSlots, createBooking } from '@/lib/actions/booking.actions'; // <-- Direct import
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  user: UserProfile;
}

export function BookingModal({ isOpen, onClose, service, user }: BookingModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [date, setDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dailyLimitReached = user.dailyBookings >= 10;
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  useEffect(() => {
    if (!date || !service) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      const unavailable = await getUnavailableSlots(service._id, date);
      const available = service.timeSlots.filter(slot => !unavailable.includes(slot));
      setAvailableSlots(available);
      setSelectedTimeSlot(''); 
      setIsLoadingSlots(false);
    };

    fetchSlots();
  }, [date, service._id, service.timeSlots]);

  const handleBooking = async () => {
    if (!date || !selectedTimeSlot) {
      toast({ title: "Please select a date and time slot.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    try {
        const bookingData: BookingFormData = {
            serviceId: service._id,
            bookingDate: date.toISOString(),
            timeSlot: selectedTimeSlot,
            address: user.address,
            totalPrice: service.price,
            currency: user.currency,
        };

        // --- FIX: Directly call the server action ---
        await createBooking(bookingData);
        
        toast({ 
          title: "Booking Request Sent!", 
          description: "The provider has been notified." 
        });
        onClose();
        router.push('/dashboard/my-bookings');
        router.refresh();

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: (error as Error).message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Book: {service.title}</DialogTitle>
                <DialogDescription>Select your preferred date and time.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                {dailyLimitReached ? (
                    <Alert variant="destructive"><Ban className="h-5 w-5" /><AlertTitle>Daily Booking Limit Reached</AlertTitle></Alert>
                ) : (
                    <>
                        <div>
                            <Label className="flex items-center mb-2"><CalendarClock className="mr-2 h-5 w-5"/>Select Date</Label>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1)) || day > threeMonthsFromNow}
                                className="rounded-md border"
                            />
                        </div>
                        
                        {date && (
                            <div>
                                <Label className="flex items-center mb-2"><Clock className="mr-2 h-5 w-5"/>Available Slots</Label>
                                {isLoadingSlots ? (
                                    <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                                ) : availableSlots.length > 0 ? (
                                    <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} className="grid grid-cols-2 gap-2">
                                        {availableSlots.map(slot => (
                                            <Label key={slot} htmlFor={slot} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent has-[:checked]:bg-primary/10 cursor-pointer">
                                                <RadioGroupItem value={slot} id={slot} />
                                                <span>{slot.replace(/_/g, ' ')}</span>
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                ) : (
                                    <p className="text-sm text-muted-foreground p-3 border rounded-md">No available slots.</p>
                                )}
                            </div>
                        )}
                        <Alert className="border-green-500"><ShieldCheck className="h-5 w-5 text-green-600" /><AlertTitle>Booking is Free!</AlertTitle></Alert>
                    </>
                )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleBooking} disabled={isSubmitting || dailyLimitReached || !date || !selectedTimeSlot}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Request"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}