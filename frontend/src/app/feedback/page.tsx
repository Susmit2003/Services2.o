"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Send } from 'lucide-react';

export default function FeedbackPage() {
    const { toast } = useToast();
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (feedback.length < 10) {
            toast({
                title: "Feedback is too short",
                description: "Please provide a bit more detail.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        // In a real app, you would send this to your backend
        console.log("Feedback Submitted:", feedback);
        
        setTimeout(() => {
            toast({
                title: "Feedback Sent!",
                description: "Thank you for helping us improve.",
            });
            setFeedback('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold flex items-center">
                    <Lightbulb className="mr-4 h-10 w-10 text-primary" />
                    Share Your Feedback
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Have an idea or suggestion? We'd love to hear from you.
                </p>
            </header>
            
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Your Feedback</CardTitle>
                    <CardDescription>Let us know what you think or what we can improve.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Type your feedback here..."
                            className="min-h-[150px]"
                            required
                        />
                    </CardContent>
                    <CardContent className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Submitting..." : "Submit Feedback"}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}