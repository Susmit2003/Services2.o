// "use client";

// import { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Calendar } from '@/components/ui/calendar';
// import { useToast } from '@/hooks/use-toast';
// import { createBooking, getUnavailableSlots } from '@/lib/actions/booking.actions';
// import type { Service, UserProfile, BookingFormData } from '@/types';
// import { Loader2, MapPin } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// interface BookingModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   service: Service;
//   user: UserProfile;
// }

// export function BookingModal({ isOpen, onClose, service, user }: BookingModalProps) {
//   const { toast } = useToast();
//   const router = useRouter();
//   const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);

//   // --- FIX: Add state for address fields ---
//   const [address, setAddress] = useState(user.address?.line1 || '');
//   const [city, setCity] = useState(user.address?.city || '');
//   const [pinCode, setPinCode] = useState(user.address?.pinCode || '');

//   useEffect(() => {
//     if (!bookingDate || !service) return;
//     const fetchUnavailable = async () => {
//         const slots = await getUnavailableSlots(service._id, bookingDate);
//         setUnavailableSlots(slots);
//     };
//     fetchUnavailable();
//   }, [bookingDate, service]);

//   const handleBookingSubmit = async () => {
//     if (!bookingDate || !selectedTimeSlot) {
//       toast({ title: "Please select a date and time slot.", variant: "destructive" });
//       return;
//     }
//     // --- FIX: Add validation for address fields ---
//     if (!address || !city || !pinCode) {
//         toast({ title: "Please provide a complete service address.", variant: "destructive"});
//         return;
//     }

//     setIsLoading(true);
//     try {
//       const bookingData: BookingFormData = {
//         serviceId: service._id,
//         bookingDate: bookingDate.toISOString(),
//         timeSlot: selectedTimeSlot,
//         // Use the state values for the address
//         address: { line1: address, city, pinCode },
//         totalPrice: service.price,
//         currency: user.currency,
//       };
//       await createBooking(bookingData);

//       toast({ title: "Booking Request Sent!", description: "The provider has been notified." });
//       onClose();
//       router.push('/dashboard/my-bookings');
//     } catch (error: any) {
//       toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md" style={{ maxHeight: '95vh', overflowY: 'auto' }}>
//         <DialogHeader>
//           <DialogTitle>Book Service: {service.title}</DialogTitle>
//           <DialogDescription>Confirm the details for your booking request.</DialogDescription>
//         </DialogHeader>
//         <div className="grid gap-6 py-4">
//           <div className="space-y-2">
//             <Label>Select a Date</Label>
//             <Calendar
//               mode="single"
//               selected={bookingDate}
//               onSelect={setBookingDate}
//               disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
//               className="rounded-md border"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label>Select a Time Slot</Label>
//             <div className="grid grid-cols-2 gap-2">
//               {service.timeSlots.map(slot => (
//                 <Button key={slot} variant={selectedTimeSlot === slot ? 'default' : 'outline'} onClick={() => setSelectedTimeSlot(slot)} disabled={unavailableSlots.includes(slot)}>
//                   {slot.replace(/_/g, ' ')}
//                 </Button>
//               ))}
//             </div>
//           </div>
//            {/* --- FIX: Add address input fields --- */}
//           <div className="space-y-2">
//              <Label className="flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary"/>Service Address</Label>
//              <div className="space-y-2">
//                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address Line 1" required />
//                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
//                <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="PIN/ZIP Code" required />
//              </div>
//              <p className="text-xs text-muted-foreground mt-1">Auto-filled from your profile. You can edit if needed.</p>
//            </div>
//         </div>
//         <DialogFooter>
//           <Button variant="ghost" onClick={onClose}>Cancel</Button>
//           <Button onClick={handleBookingSubmit} disabled={isLoading}>
//             {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//             Confirm Booking
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import { useState, useEffect } from 'react';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  user: UserProfile;
}

export function BookingModal({ isOpen, onClose, service, user }: BookingModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [bookingDate, setBookingDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);

  const [address, setAddress] = useState(user.address?.line1 || '');
  const [city, setCity] = useState(user.address?.city || '');
  const [pinCode, setPinCode] = useState(user.address?.pinCode || '');

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!bookingDate || !service) return;
    const fetchUnavailable = async () => {
        const slots = await getUnavailableSlots(service._id, bookingDate);
        setUnavailableSlots(slots);
    };
    fetchUnavailable();
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
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-11",
                    !bookingDate && "text-muted-foreground"
                  )}
                >
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
                      setIsCalendarOpen(false); // Close the popover on select
                  }}
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Select a Time Slot</Label>
            <div className="grid grid-cols-2 gap-2">
              {service.timeSlots.map(slot => (
                <Button key={slot} variant={selectedTimeSlot === slot ? 'default' : 'outline'} onClick={() => setSelectedTimeSlot(slot)} disabled={unavailableSlots.includes(slot)}>
                  {slot.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
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
          <Button onClick={handleBookingSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}