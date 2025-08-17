// "use client";

// import { useState, useEffect } from 'react';
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { Bell, BellOff } from "lucide-react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { getNotifications } from "@/lib/actions/notification.actions"; // Correct import
// import type { Notification } from "@/types";
// import { useAuth } from '@/context/auth-context';
// import { FormattedDate } from '../custom/FormattedDate';

// export function NotificationsPopover() {
//     const { isLoggedIn } = useAuth();
//     const [notifications, setNotifications] = useState<Notification[]>([]);
//     const [unreadCount, setUnreadCount] = useState(0);

//     useEffect(() => {
//         if (isLoggedIn) {
//             // Fetch notifications when the user is logged in
//             getNotifications().then(data => {
//                 setNotifications(data);
//                 setUnreadCount(data.filter(n => !n.isRead).length);
//             });
//         }
//     }, [isLoggedIn]);

//     if (!isLoggedIn) return null;
    
//     return (
//         <Popover>
//             <PopoverTrigger asChild>
//                 <Button variant="ghost" size="icon" className="relative">
//                     <Bell className="h-5 w-5" />
//                     {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-80" align="end">
//                 <Card className="border-none">
//                     <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
//                     <CardContent className="p-0">
//                         {notifications.length > 0 ? (
//                             <div className="flex flex-col gap-2 max-h-96 overflow-y-auto p-2">
//                                 {notifications.map(notif => (
//                                     <div key={notif._id} className={`p-3 rounded-lg ${!notif.isRead ? 'bg-primary/10' : ''}`}>
//                                         <p className="font-semibold">{notif.title}</p>
//                                         <p className="text-sm text-muted-foreground">{notif.message}</p>
//                                         <p className="text-xs text-muted-foreground mt-1"><FormattedDate date={notif.createdAt} /></p>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="text-center p-8">
//                                 <BellOff className="mx-auto h-12 w-12 text-muted-foreground/50" />
//                                 <p className="mt-4 text-muted-foreground">You have no notifications.</p>
//                             </div>
//                         )}
//                     </CardContent>
//                 </Card>
//             </PopoverContent>
//         </Popover>
//     );
// }





// "use client";

// import { useState, useEffect } from 'react';
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { Bell, BellRing, BellOff } from "lucide-react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { getNotifications, markAllNotificationsAsRead } from "@/lib/actions/notification.actions";
// import type { Notification } from "@/types";
// import { useAuth } from '@/context/auth-context';
// import { FormattedDate } from '../custom/FormattedDate';
// import { useRouter } from 'next/navigation';

// export function NotificationsPopover() {
//     const { isLoggedIn } = useAuth();
//     const router = useRouter();
//     const [notifications, setNotifications] = useState<Notification[]>([]);
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [isOpen, setIsOpen] = useState(false);

//     useEffect(() => {
//         if (isLoggedIn) {
//             getNotifications().then(data => {
//                 setNotifications(data);
//                 setUnreadCount(data.filter(n => !n.isRead).length);
//             });
//         }
//     }, [isLoggedIn]);

//     // This function handles marking notifications as read when the popover is opened.
//     const handleOpenChange = async (open: boolean) => {
//         setIsOpen(open);
//         if (open && unreadCount > 0) {
//             // Optimistically update the UI to feel instant
//             setUnreadCount(0);
//             setNotifications(notifications.map(n => ({ ...n, isRead: true })));
//             // Then, tell the server to mark them as read
//             await markAllNotificationsAsRead();
//         }
//     };

//     // This function handles the navigation when a notification is clicked.
//     const handleNotificationClick = (notification: Notification) => {
//         setIsOpen(false); // Close the popover
//         if (notification.type === 'booking' && notification.data?.bookingId) {
//             // Navigate to the relevant page
//             router.push('/dashboard/provider-schedule');
//         }
//         // You can add more navigation logic for other types (e.g., 'review') here
//     };

//     if (!isLoggedIn) return null;
    
//     return (
//         <Popover open={isOpen} onOpenChange={handleOpenChange}>
//             <PopoverTrigger asChild>
//                 <Button variant="ghost" size="icon" className="relative">
//                     <Bell className="h-5 w-5" />
//                     {unreadCount > 0 && (
//                         <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
//                     )}
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-80" align="end">
//                 <Card className="border-none shadow-none">
//                     <CardHeader>
//                         <CardTitle className="font-headline text-lg">Notifications</CardTitle>
//                     </CardHeader>
//                     <CardContent className="p-0">
//                         {notifications.length > 0 ? (
//                             <div className="flex flex-col gap-1 max-h-96 overflow-y-auto p-1">
//                                 {notifications.map(notif => (
//                                     <div 
//                                         key={notif._id} 
//                                         className={`p-3 rounded-lg hover:bg-muted cursor-pointer`}
//                                         onClick={() => handleNotificationClick(notif)}
//                                     >
//                                         <p className="font-semibold flex items-center gap-2">
//                                             {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
//                                             {notif.title}
//                                         </p>
//                                         <p className="text-sm text-muted-foreground pl-4">{notif.message}</p>
//                                         <p className="text-xs text-muted-foreground mt-1 pl-4"><FormattedDate date={notif.createdAt} /></p>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="text-center p-8">
//                                 <BellOff className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
//                                 <p className="text-muted-foreground">You have no notifications.</p>
//                             </div>
//                         )}
//                     </CardContent>
//                 </Card>
//             </PopoverContent>
//         </Popover>
//     );
// }




"use client";

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, BellOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getNotifications, markAllNotificationsAsRead } from "@/lib/actions/notification.actions";
import type { Notification } from "@/types";
import { useAuth } from '@/context/auth-context';
import { FormattedDate } from '../custom/FormattedDate';
import { useRouter } from 'next/navigation';

export function NotificationsPopover() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            getNotifications().then(data => {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            });
        }
    }, [isLoggedIn]);

    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open && unreadCount > 0) {
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            await markAllNotificationsAsRead();
        }
    };

    // --- THIS IS THE FIX ---
    // This function now uses the 'redirectUrl' from the notification data.
    const handleNotificationClick = (notification: Notification) => {
        setIsOpen(false); // Close the popover
        if (notification.data?.redirectUrl) {
            router.push(notification.data.redirectUrl);
        }
    };

    if (!isLoggedIn) return null;
    
    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <Card className="border-none shadow-none">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.length > 0 ? (
                            <div className="flex flex-col gap-1 max-h-96 overflow-y-auto p-1">
                                {notifications.map(notif => (
                                    <div 
                                        key={notif._id} 
                                        className="p-3 rounded-lg hover:bg-muted cursor-pointer"
                                        onClick={() => handleNotificationClick(notif)} // Click handler added
                                    >
                                        <p className="font-semibold flex items-center gap-2">
                                            {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            {notif.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground pl-4">{notif.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1 pl-4"><FormattedDate date={notif.createdAt} /></p>
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