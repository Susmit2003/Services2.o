"use client";

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getNotifications } from "@/lib/actions/notification.actions"; // Correct import
import type { Notification } from "@/types";
import { useAuth } from '@/context/auth-context';
import { FormattedDate } from '../custom/FormattedDate';

export function NotificationsPopover() {
    const { isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isLoggedIn) {
            // Fetch notifications when the user is logged in
            getNotifications().then(data => {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            });
        }
    }, [isLoggedIn]);

    if (!isLoggedIn) return null;
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <Card className="border-none">
                    <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {notifications.length > 0 ? (
                            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
                                {notifications.map(notif => (
                                    <div key={notif._id} className={`p-3 rounded-lg ${!notif.isRead ? 'bg-primary/10' : ''}`}>
                                        <p className="font-semibold">{notif.title}</p>
                                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1"><FormattedDate date={notif.createdAt} /></p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <BellOff className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-4 text-muted-foreground">You have no notifications.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}