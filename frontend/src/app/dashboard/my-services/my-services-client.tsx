"use client";

import { useState } from 'react';
import type { Service } from '@/types';
import { ServiceCard } from '@/components/custom/service-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Frown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface MyServicesClientProps {
  initialServices: Service[];
}

export function MyServicesClient({ initialServices }: MyServicesClientProps) {
  const [services, setServices] = useState(initialServices);
  
  return (
    <div>
      <div className="flex justify-end mb-6">
        <Link href="/dashboard/my-services/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </Link>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard 
              key={service._id} 
              service={service} 
              isProviderView={true} // This prop shows the Edit/Delete/Toggle buttons
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-20 border-2 border-dashed rounded-lg">
          <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardHeader>
            <CardTitle className="mt-4 text-2xl font-semibold">No Services Found</CardTitle>
            <CardDescription className="mt-2">
                You haven't listed any services yet. Get started by adding one.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}