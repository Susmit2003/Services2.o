"use client";

import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { currentUser } = useAuth();
    
    // The layout now guarantees that if this page renders, the user is logged in.
    // We just show a loader while the currentUser data is being hydrated.
    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold">Welcome, {currentUser.name}!</h1>
                <p className="text-lg text-muted-foreground">Here is an overview of your account.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Your Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Email: {currentUser.email}</p>
                    <p>Mobile: {currentUser.mobile}</p>
                </CardContent>
            </Card>
        </div>
    );
}