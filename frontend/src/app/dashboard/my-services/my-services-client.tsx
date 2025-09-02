// "use client";

// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Star } from "lucide-react";
// import type { Service } from "@/types";
// import Image from 'next/image';
// import { ServiceStatusToggle } from "@/components/custom/service-status-toggle";
// import { DeleteServiceButton } from "@/components/custom/delete-service-button";

// interface MyServicesClientProps {
//     services: Service[];
// }

// // --- THIS IS THE FIX ---
// // Added the missing 'export default' statement.
// export default function MyServicesClient({ services }: MyServicesClientProps) {
//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {services.map((service) => (
//                 <Card key={service._id} className="flex flex-col h-full overflow-hidden shadow-lg">
//                     <CardHeader className="p-0 relative">
//                         <Image
//                             src={service.images[0] || 'https://placehold.co/600x400.png'}
//                             alt={service.title}
//                             width={600}
//                             height={400}
//                             className="w-full h-48 object-cover"
//                         />
//                     </CardHeader>
//                     <CardContent className="p-4 flex-grow">
//                         <Badge variant="secondary" className="mb-2">{service.category}</Badge>
//                         <CardTitle className="font-headline text-lg mb-2 truncate">{service.title}</CardTitle>
//                         <div className="flex items-center text-sm text-muted-foreground mb-2">
//                             <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
//                             <span>{service.ratingAvg.toFixed(1)} ({service.totalReviews} reviews)</span>
//                         </div>
//                     </CardContent>
//                     <CardFooter className="p-4 border-t bg-muted/50 flex justify-between items-center">
//                         <ServiceStatusToggle serviceId={service._id} initialStatus={service.status as 'Active' | 'Inactive'} />
//                         <DeleteServiceButton serviceId={service._id} />
//                     </CardFooter>
//                 </Card>
//             ))}
//         </div>
//     );
// }



"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Service } from "@/types";
import Image from 'next/image';
import { ServiceStatusToggle } from "@/components/custom/service-status-toggle";
import { DeleteServiceButton } from "@/components/custom/delete-service-button";

interface MyServicesClientProps {
    services: Service[];
}

export default function MyServicesClient({ services }: MyServicesClientProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
                <Card key={service._id} className="flex flex-col h-full overflow-hidden shadow-lg">
                    <CardHeader className="p-0 relative">
                        <Image
                            src={service.images[0] || 'https://placehold.co/600x400.png'}
                            alt={service.title}
                            width={600}
                            height={400}
                            className="w-full h-48 object-cover"
                        />
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <Badge variant="secondary" className="mb-2">{service.category}</Badge>
                        <CardTitle className="font-headline text-lg mb-2 truncate">{service.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                            <span>{service.ratingAvg.toFixed(1)} ({service.totalReviews} reviews)</span>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t bg-muted/50 flex justify-between items-center">
                        <ServiceStatusToggle serviceId={service._id} initialStatus={service.status as 'Active' | 'Inactive'} />
                        
                        {/* ✅ FIX: Add the missing serviceTitle and isArchived props */}
                        <DeleteServiceButton 
                            serviceId={service._id} 
                            serviceTitle={service.title}
                            isArchived={service.status === 'Archived'}
                        />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}