"use client";

import { useState, useEffect } from 'react';
import type { Service, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Ban, LogIn, Loader2, CalendarClock, MapPin, Send, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { createBooking, getUnavailableSlots } from '@/lib/actions/booking.actions';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
    service: Service;
    user: UserProfile | null;
}

export function BookingForm({ service, user }: BookingFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [date, setDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  const [address, setAddress] = useState(user?.address?.line1 || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [pinCode, setPinCode] = useState(user?.address?.pinCode || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRequested, setBookingRequested] = useState<boolean>(false);

  const dailyLimitReached = user ? (user.dailyBookings ?? 0) >= 10 : false;
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !date || !selectedTimeSlot) {
      toast({ title: "Please select a date and time.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    try {
        const bookingData = {
            serviceId: service._id,
            bookingDate: date.toISOString(),
            timeSlot: selectedTimeSlot,
            address: { line1: address, city, pinCode },
            totalPrice: service.price,
            currency: user.currency,
        };

        await createBooking(bookingData);
        setBookingRequested(true);

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (bookingRequested) {
    return (
      <Card className="border-none shadow-none">
        <CardContent className="p-8 text-center">
          <Send className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="font-headline text-2xl mb-2">Booking Requested!</h2>
          <p className="text-muted-foreground mb-6">Your request has been sent. Check "My Bookings" for status updates.</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/dashboard/my-bookings')}>View My Bookings</Button>
            <Button variant="outline" size="lg" onClick={() => router.push('/all-services')}>Browse More</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <form onSubmit={handleBooking}>
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center"><ShoppingCart className="mr-2 h-6 w-6"/> Book This Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!user ? (
            <Alert><LogIn className="h-5 w-5" /><AlertTitle>Please Log In</AlertTitle><AlertDescription>You need an account to book a service.</AlertDescription></Alert>
          ) : dailyLimitReached ? (
            <Alert variant="destructive"><Ban className="h-5 w-5" /><AlertTitle>Daily Limit Reached</AlertTitle><AlertDescription>You cannot book more than 10 services today.</AlertDescription></Alert>
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
                        <Label key={slot} htmlFor={slot} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-accent cursor-pointer">
                          <RadioGroupItem value={slot} id={slot} />
                          <span>{slot.replace(/_/g, ' ')}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 border rounded-md">No available slots for this day.</p>
                  )}
                </div>
              )}
              <div>
                <Label className="flex items-center mb-2"><MapPin className="mr-2 h-5 w-5"/>Service Address</Label>
                <div className="space-y-2">
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address Line 1" required />
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
                  <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="PIN/ZIP Code" required />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Auto-filled from your profile. You can edit if needed.</p>
              </div>
              
              <Alert className="border-green-500"><ShieldCheck className="h-5 w-5 text-green-600" /><AlertTitle>Booking is Free!</AlertTitle><AlertDescription>You only pay the provider directly for their work.</AlertDescription></Alert>
            </>
          )}
        </CardContent>
        <CardFooter>
          {!user ? (
            <Link href="/login" className="w-full"><Button className="w-full h-12 text-lg"><LogIn className="mr-2 h-5 w-5"/> Login to Book</Button></Link>
          ) : (
            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || dailyLimitReached || !date || !selectedTimeSlot}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Booking Request"}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}