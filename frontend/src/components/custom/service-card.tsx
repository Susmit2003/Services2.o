"use client";

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, ArrowRight, Edit } from 'lucide-react';
import type { Service } from '@/types';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { BookingModal } from './booking-modal';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const isOwnService = currentUser?._id === service.providerId;

  const handleBookNowClick = () => {
    if (!currentUser) {
      toast({ title: "Please log in to book a service.", variant: "destructive" });
      return;
    }
    if (isOwnService) {
        toast({
            title: "Action Not Allowed",
            description: "You cannot book your own service.",
            variant: "destructive"
        });
        return;
    }
    setIsBookingModalOpen(true);
  };

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden shadow-lg">
        <CardHeader className="p-0">
          <Image src={service.images[0]} alt={service.title} width={600} height={400} className="w-full h-48 object-cover" />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Badge variant="secondary" className="mb-2">{service.category}</Badge>
          <CardTitle className="font-headline text-lg truncate">{service.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
            <span>{service.ratingAvg.toFixed(1)} ({service.totalReviews} reviews)</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex justify-between items-center w-full">
            <p className="font-bold text-lg">{service.priceDisplay}</p>
            {isOwnService ? (
              <Link href="/dashboard/my-services"><Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Manage</Button></Link>
            ) : (
              <Button onClick={handleBookNowClick}>Book Now <ArrowRight className="w-4 h-4 ml-2" /></Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {currentUser && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          service={service}
          user={currentUser}
        />
      )}
    </>
  );
}