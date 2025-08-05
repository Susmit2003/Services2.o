"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/custom/notification-list";
import { useAuth } from "@/context/auth-context";
import useSWR, { mutate } from "swr";
import { getUserNotifications, markAllNotificationsAsRead } from "@/lib/actions/notification.actions";
import { swrKeys } from "@/lib/swr-config";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Notification } from "@/types"; // <-- Import the Notification type

export function NotificationsPopover() {
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // We can also give useSWR a hint about the expected data type
  const { data: notifications, error, isLoading } = useSWR<Notification[]>(
    isLoggedIn ? swrKeys.notifications : null,
    getUserNotifications
  );

  // --- FIX: Add the 'Notification' type to the parameter 'n' ---
  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      // --- FIX: Add the 'Notification' type to the parameter 'n' here as well ---
      const updatedNotifications = notifications?.map((n: Notification) => ({ ...n, isRead: true }));
      
      mutate(swrKeys.notifications, updatedNotifications, false);
      
      await markAllNotificationsAsRead();
      mutate(swrKeys.notifications);

    } catch (err) {
      toast({
        title: "Error",
        description: "Could not mark notifications as read.",
        variant: "destructive",
      });
      mutate(swrKeys.notifications);
    }
  };
  
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4 font-medium border-b">
          <h4>Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          error={error}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}