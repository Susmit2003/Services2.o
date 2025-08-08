import { getServiceById } from '@/lib/actions/service.actions';
import { getUserProfile } from '@/lib/actions/user.actions';
import { BookingForm } from '@/components/custom/booking-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function BookServicePage({ params }: { params: { serviceId: string } }) {
    const service = await getServiceById(params.serviceId);
    let user = null;
    try {
        user = await getUserProfile();
    } catch (error) {
        // User is not logged in, which is fine. The BookingForm will handle it.
    }
    
    if (!service) {
        notFound();
    }

    return (
        <div className="container mx-auto max-w-6xl py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* --- Left Column: Service Details --- */}
                <div className="lg:col-span-3">
                    <Card className="overflow-hidden">
                        <CardHeader className="p-0">
                             <Image
                                src={service.images[0] || 'https://placehold.co/1200x800.png'}
                                alt={service.title}
                                width={1200}
                                height={800}
                                className="w-full h-auto object-cover"
                            />
                        </CardHeader>
                        <CardContent className="p-6">
                             <CardTitle className="font-headline text-3xl mb-4">{service.title}</CardTitle>
                             <div className="flex items-center text-lg text-muted-foreground mb-4">
                               <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                               <span>{service.ratingAvg.toFixed(1)} ({service.totalReviews} reviews)</span>
                             </div>
                             <CardDescription className="text-base">{service.description}</CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* --- Right Column: Booking Form --- */}
                {/* This div will stick to the top and scroll independently */}
                <div className="lg:col-span-2 lg:sticky lg:top-8 self-start">
                    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto rounded-lg border shadow-lg">
                        <BookingForm service={service} user={user} />
                    </div>
                </div>

            </div>
        </div>
    );
}