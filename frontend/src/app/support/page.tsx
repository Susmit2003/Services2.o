"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bug, Send } from 'lucide-react';

export default function ReportBugPage() {
    const { toast } = useToast();
    const [bugReport, setBugReport] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (bugReport.length < 20) {
            toast({
                title: "Report is too short",
                description: "Please describe the bug in more detail.",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        console.log("Bug Report Submitted:", bugReport);
        
        setTimeout(() => {
            toast({
                title: "Bug Report Sent!",
                description: "Thank you! Our team will look into it.",
            });
            setBugReport('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold flex items-center">
                    <Bug className="mr-4 h-10 w-10 text-destructive" />
                    Report a Bug
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Encountered an issue? Please describe it below so we can fix it.
                </p>
            </header>
            
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Bug Report</CardTitle>
                    <CardDescription>Please be as detailed as possible. What were you doing when the bug occurred?</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <Textarea
                            value={bugReport}
                            onChange={(e) => setBugReport(e.target.value)}
                            placeholder="Describe the bug you found..."
                            className="min-h-[150px]"
                            required
                        />
                    </CardContent>
                    <CardContent className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            <Send className="mr-2 h-4 w-4" />
                             {isSubmitting ? "Submitting..." : "Submit Report"}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}