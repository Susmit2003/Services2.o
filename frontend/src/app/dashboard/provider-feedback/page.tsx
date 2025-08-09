import { getProviderFeedback } from "@/lib/actions/review.actions"; // We'll add this action next
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { RatingStars } from "@/components/custom/rating-stars";
import { FormattedDate } from "@/components/custom/FormattedDate";

export default async function ProviderFeedbackPage() {
    const reviews = await getProviderFeedback();

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold">Your Feedback</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Here's what customers are saying about your services.
                </p>
            </header>
            
            {reviews.length > 0 ? (
                <div className="flex flex-col gap-6">
                    {reviews.map((review: any) => (
                        <Card key={review._id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{review.service.title}</CardTitle>
                                        <CardDescription>From: {review.user.name} on <FormattedDate date={review.createdAt} /></CardDescription>
                                    </div>
                                    <RatingStars rating={review.rating} />
                                </div>
                            </CardHeader>
                            {review.comment && (
                                <CardContent>
                                    <p className="text-muted-foreground italic">"{review.comment}"</p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <p>You have not received any feedback yet.</p>
            )}
        </div>
    );
}