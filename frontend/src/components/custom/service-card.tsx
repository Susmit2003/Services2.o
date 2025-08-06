"use client";

import type { Service } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from './rating-stars';
import { ArchiveServiceButton } from './delete-service-button';
import { ServiceStatusToggle } from './service-status-toggle';
import { Edit, Eye } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  isProviderView?: boolean; // This prop controls if the edit/delete buttons are shown
  onActionComplete?: () => void;
}

export function ServiceCard({ service, isProviderView = false, onActionComplete }: ServiceCardProps) {

  const getStatusBadge = (status: Service['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Archived': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="flex flex-col shadow-lg overflow-hidden h-full">
      <div className="relative h-48 w-full">
        <Image
          src={service.images?.[0] || 'https://placehold.co/600x400.png'}
          alt={service.title}
          layout="fill"
          objectFit="cover"
        />
        {isProviderView && (
            <Badge className={`absolute top-2 right-2 ${getStatusBadge(service.status)}`}>{service.status}</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="truncate font-headline">{service.title}</CardTitle>
        <CardDescription className="truncate">{service.category} {'>'} {service.subCategory}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <RatingStars rating={service.ratingAvg || 0} totalReviews={service.totalReviews || 0} />
        <p className="text-lg font-semibold text-foreground">{service.priceDisplay}</p>
        <p className="text-muted-foreground text-xs">Provider: {service.providerName}</p>
      </CardContent>
      
      {isProviderView ? (
        // --- PROVIDER VIEW FOOTER ---
        <CardFooter className="border-t p-4 flex justify-between items-center gap-2">
            <div className="flex-1">
                {service.status !== 'Archived' && (
                    // --- FIX: Pass the correct service.id to the toggle component ---
                    <ServiceStatusToggle serviceId={service._id} initialStatus={service.status as 'Active' | 'Inactive'} />
                )}
            </div>
            <div className="flex gap-2">
                <Link href={`/dashboard/my-services/edit/${service._id}`}>
                    <Button variant="outline" size="icon" title="Edit Service">
                        <Edit className="h-4 w-4" />
                    </Button>
                </Link>
                <ArchiveServiceButton 
                  serviceId={service._id} 
                  serviceTitle={service.title} 
                  isArchived={service.status === 'Archived'}
                />
            </div>
        </CardFooter>
      ) : (
        // --- PUBLIC VIEW FOOTER ---
        <CardFooter className="border-t p-4">
            <Link href={`/all-services/${service._id}/book`} className="w-full">
                <Button className="w-full">View Details</Button>
            </Link>
        </CardFooter>
      )}
    </Card>
  );
}