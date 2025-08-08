"use client";

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, BellOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getNotifications, markAllNotificationsAsRead } from "@/lib/actions/notification.actions"; // <-- FIX: Import the correct function name
import type { Notification } from "@/types";
import { useAuth } from '@/context/auth-context';
import { FormattedDate } from '../custom/FormattedDate';
import { useRouter } from 'next/navigation';

export function NotificationsPopover() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isLoggedIn) {
            // --- FIX: Call the correct function name ---
            getNotifications().then(data => {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            });
        }
    }, [isLoggedIn]);

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        router.refresh(); // Refreshes data on other pages
    };

    if (!isLoggedIn) {
        return null; // Don't show the popover if the user is not logged in
    }
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <Card className="border-none shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="font-headline text-lg">Notifications</CardTitle>
                        {unreadCount > 0 && (
                            <Button variant="link" size="sm" onClick={handleMarkAllRead}>Mark all as read</Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.length > 0 ? (
                            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
                                {notifications.map(notif => (
                                    <div key={notif._id} className={`p-3 rounded-lg ${!notif.isRead ? 'bg-primary/10' : ''}`}>
                                        <p className="font-semibold flex items-center gap-2">
                                            <BellRing className="h-4 w-4 text-primary" /> {notif.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1"><FormattedDate date={notif.createdAt} /></p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <BellOff className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">You have no notifications.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}