import { getNotifications } from "@/lib/actions/notification.actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BellRing, BellOff } from "lucide-react";
import type { Notification } from "@/types";
import { FormattedDate } from "@/components/custom/FormattedDate";

export default async function NotificationsPage() {
    let notifications: Notification[] = [];
    try {
        // --- FIX: Call the correct function to get notifications ---
        notifications = await getNotifications();
    } catch (error) {
        console.error("Error on notifications page:", error);
    }

    if (notifications.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="text-center w-full max-w-lg p-8">
                    <CardHeader>
                        <BellOff className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                        <CardTitle className="font-headline text-2xl">No New Notifications</CardTitle>
                        <CardDescription>
                            You're all caught up! Important updates will appear here.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8"> 
            <header>
                <h1 className="font-headline text-4xl font-bold">Your Notifications</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Here are your latest updates and alerts.
                </p>
            </header>
            
            <div className="flex flex-col gap-4">
                {notifications.map((notification) => (
                    <Card key={notification._id} className={!notification.isRead ? "border-primary bg-primary/5" : ""}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BellRing className="h-5 w-5 text-primary" />
                                        {notification.title}
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        <FormattedDate date={notification.createdAt} />
                                    </CardDescription>
                                </div>
                                {!notification.isRead && (
                                    <div className="h-2 w-2 rounded-full bg-primary mt-1 animate-pulse"></div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>{notification.message}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}