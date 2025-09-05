// "use client";

// import type { Notification } from "@/types";
// import Link from "next/link";
// import { Loader2, AlertTriangle } from "lucide-react";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { formatDistanceToNow } from 'date-fns';

// // --- FIX: START ---
// // Define an interface for the props that this component will receive.
// // This is what solves the TypeScript error.
// interface NotificationListProps {
//   notifications: Notification[] | undefined;
//   isLoading: boolean;
//   error: any;
//   onClose: () => void; // Function to close the popover when a notification is clicked
// }
// // --- FIX: END ---

// export function NotificationList({ notifications, isLoading, error, onClose }: NotificationListProps) {

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//         <div className="flex flex-col items-center justify-center p-4 text-center text-sm text-destructive">
//             <AlertTriangle className="h-6 w-6 mb-2" />
//             <p>Could not load notifications.</p>
//         </div>
//     )
//   }

//   if (!notifications || notifications.length === 0) {
//     return <p className="p-8 text-center text-sm text-muted-foreground">You have no notifications.</p>;
//   }

//   return (
//     <ScrollArea className="h-96">
//       <div className="flex flex-col">
//         {notifications.map((notification) => (
//           <Link
//             key={notification.id}
//             href={notification.link || '#'}
//             className="block p-4 border-b hover:bg-secondary/50"
//             onClick={onClose} // Close popover on click
//           >
//             <div className="flex items-start">
//                 {!notification.isRead && (
//                     <span className="h-2 w-2 mt-1.5 mr-3 rounded-full bg-primary" />
//                 )}
//                 <div className="flex-1">
//                     <p className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
//                     <p className="text-sm text-muted-foreground">{notification.message}</p>
//                     <p className="text-xs text-muted-foreground mt-1">
//                         {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
//                     </p>
//                 </div>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </ScrollArea>
//   );
// }



"use client";

import type { Notification } from "@/types";
import { Loader2, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';

// Props interface for the component
interface NotificationListProps {
    notifications: Notification[] | undefined;
    isLoading: boolean;
    error: any;
    // ✅ FIX: Use a generic click handler prop instead of relying on a 'link'
    onNotificationClick: (notification: Notification) => void;
}

export function NotificationList({ notifications, isLoading, error, onNotificationClick }: NotificationListProps) {

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center text-sm text-destructive">
                <AlertTriangle className="h-6 w-6 mb-2" />
                <p>Could not load notifications.</p>
            </div>
        )
    }

    if (!notifications || notifications.length === 0) {
        return <p className="p-8 text-center text-sm text-muted-foreground">You have no notifications.</p>;
    }

    return (
        <ScrollArea className="h-96">
            <div className="flex flex-col">
                {notifications.map((notification) => (
                    // ✅ FIX: Use a clickable div that calls the onNotificationClick prop
                    <div
                        key={notification._id}
                        className="block p-4 border-b hover:bg-secondary/50 cursor-pointer"
                        onClick={() => onNotificationClick(notification)}
                    >
                        <div className="flex items-start">
                            {!notification.isRead && (
                                <span className="h-2 w-2 mt-1.5 mr-3 rounded-full bg-primary" />
                            )}
                            <div className="flex-1">
                                <p className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}