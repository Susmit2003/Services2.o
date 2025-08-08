"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { Home, LayoutGrid, ClipboardList, SlidersHorizontal, User } from 'lucide-react';

interface MobileFooterProps {
    navItems: {
        href: string;
        icon: LucideIcon;
        label: string;
    }[];
}

export const MobileFooter = ({ navItems }: MobileFooterProps) => {
  const pathname = usePathname();

  // Define a specific set of 5 items for the mobile footer for a clean UI
  const mobileNavItems = [
      { href: "/dashboard", icon: Home, label: "Home" },
      { href: "/all-services", icon: LayoutGrid, label: "Services" },
      { href: "/dashboard/my-bookings", icon: ClipboardList, label: "Bookings" },
      { href: "/dashboard/my-services", icon: SlidersHorizontal, label: "My Services" },
      { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm">
      <nav className="grid grid-cols-5 items-center justify-items-center p-1">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-md w-full text-muted-foreground hover:bg-muted/50 transition-colors",
                isActive && "bg-primary/10 text-primary font-semibold"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};