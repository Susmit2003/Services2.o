"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { createBooking, getUnavailableSlots } from '@/lib/actions/booking.actions';
import type { Service, UserProfile, BookingFormData } from '@/types';
import { Loader2, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns'; // We no longer need DayOfWeek
import { cn } from '@/lib/utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  user: UserProfile;
}

const dayNameToIndex: { [key: string]: number } = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
};

export function BookingModal({ isOpen, onClose, service, user }: BookingModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [bookingDate, setBookingDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const [address, setAddress] = useState(user.address?.line1 || '');
  const [city, setCity] = useState(user.address?.city || '');
  const [pinCode, setPinCode] = useState(user.address?.pinCode || '');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // --- THIS IS THE FIX (Part 1) ---
  // The 'disabledDays' constant is now correctly typed as an array of numbers.
  const disabledDays: number[] = useMemo(() => {
    const availableDayNames = new Set(service.timeSlots.map(slot => slot.split(' ')[0]));
    const availableDayIndexes = Array.from(availableDayNames).map(name => dayNameToIndex[name]);
    
    // Return an array of day indexes (0-6) that are NOT available.
    return [0, 1, 2, 3, 4, 5, 6].filter(
      index => !availableDayIndexes.includes(index)
    );
  }, [service.timeSlots]);

  useEffect(() => {
    const updateSlots = async () => {
        if (!bookingDate || !service) {
            setAvailableTimeSlots([]);
            return;
        }
        const selectedDayName = format(bookingDate, 'EEEE');
        const potentialSlotsForDay = service.timeSlots
            .filter(slot => slot.startsWith(selectedDayName))
            .map(slot => slot.replace(`${selectedDayName} `, ''));
        const alreadyBookedSlots = await getUnavailableSlots(service._id, bookingDate);
        const finalAvailableSlots = potentialSlotsForDay.filter(slot => !alreadyBookedSlots.includes(slot));
        
        setAvailableTimeSlots(finalAvailableSlots);
        setSelectedTimeSlot('');
    };
    updateSlots();
  }, [bookingDate, service]);

  const handleBookingSubmit = async () => {
    if (!bookingDate || !selectedTimeSlot) {
      toast({ title: "Please select a date and time slot.", variant: "destructive" });
      return;
    }
    if (!address || !city || !pinCode) {
        toast({ title: "Please provide a complete service address.", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    try {
      const bookingData: BookingFormData = {
        serviceId: service._id,
        bookingDate: bookingDate.toISOString(),
        timeSlot: selectedTimeSlot,
        address: { line1: address, city, pinCode },
        totalPrice: service.price,
        currency: user.currency,
      };
      await createBooking(bookingData);

      toast({ title: "Booking Request Sent!", description: "The provider has been notified." });
      onClose();
      router.push('/dashboard/my-bookings');
      router.refresh();
    } catch (error: any) {
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Book Service: {service.title}</DialogTitle>
          <DialogDescription>Confirm the details for your booking request.</DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto grid gap-6 py-4 pr-4">
          <div className="space-y-2">
            <Label>Select a Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-11", !bookingDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingDate ? format(bookingDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={(date) => {
                      setBookingDate(date);
                      setIsCalendarOpen(false);
                  }}
                  // --- THIS IS THE FIX (Part 2) ---
                  // The disabled prop now uses a simpler and more correct format.
                  disabled={{
                      before: new Date(new Date().setDate(new Date().getDate())),
                      dayOfWeek: disabledDays
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Select a Time Slot</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableTimeSlots.map(slot => (
                <Button key={slot} variant={selectedTimeSlot === slot ? 'default' : 'outline'} onClick={() => setSelectedTimeSlot(slot)}>
                  {slot}
                </Button>
              ))}
            </div>
            {bookingDate && availableTimeSlots.length === 0 && (
                <p className="text-sm text-muted-foreground text-center pt-2">No available slots for this day.</p>
            )}
          </div>
          <div className="space-y-2">
             <Label className="flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary"/>Service Address</Label>
             <div className="space-y-2">
               <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address Line 1" required />
               <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
               <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="PIN/ZIP Code" required />
             </div>
             <p className="text-xs text-muted-foreground mt-1">Auto-filled from your profile. You can edit if needed.</p>
           </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleBookingSubmit} disabled={isLoading || !selectedTimeSlot}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}