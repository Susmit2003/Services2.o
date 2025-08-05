// frontend/src/app/dashboard/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
    const { currentUser, isLoggedIn, isLoading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        // Only perform the check once loading is complete
        if (!isLoading && !isLoggedIn) {
            console.log("Dashboard auth check: User not logged in, redirecting.");
            router.push('/login');
        }
    }, [isLoggedIn, isLoading, router]);

    // Display a loading spinner while the auth state is being determined
    if (isLoading || !isLoggedIn) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    // Once checks pass, render the dashboard content
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Welcome to your Dashboard, {currentUser?.name}!</CardTitle>
                    <CardDescription>Here's an overview of your activity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>You are logged in as: {currentUser?.email}</p>
                    <p>Your role is: {currentUser?.role}</p>
                    {/* Add more dashboard components here */}
                </CardContent>
            </Card>
        </div>
    );
}