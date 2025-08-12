"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Loader2, Bell, LayoutGrid, ClipboardList, SlidersHorizontal, CalendarCheck, User, Wallet, Bug, Lightbulb } from 'lucide-react';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { AppLogo } from '@/components/icons/app-logo';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import { UserNav } from '@/components/layout/user-nav';
import { MobileFooter } from '@/components/layout/mobile-footer';
import { NotificationsPopover } from '@/components/layout/notifications-popover';
import { AppFooter } from '@/components/layout/app-footer';

// This is the main application layout for LOGGED-IN users
function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const mainNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/all-services", icon: LayoutGrid, label: "Browse Services" },
    { href: "/dashboard/my-bookings", icon: ClipboardList, label: "My Bookings" },
    { href: "/dashboard/my-services", icon: SlidersHorizontal, label: "My Services" },
    { href: "/dashboard/provider-schedule", icon: CalendarCheck, label: "Provider Schedule" },
  ];

  const footerNavItems = [
      { href: "/profile", icon: User, label: "Profile" },
      { href: "/wallet", icon: Wallet, label: "My Wallet" },
      { href: "/feedback", icon: Lightbulb, label: "Feedback" },
      { href: "/support", icon: Bug, label: "Report a Bug" },
  ];

  return (
     <SidebarProvider>
        <Sidebar className="border-r hidden md:flex">
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 font-headline text-xl p-4">
              <AppLogo className="h-8 w-8 text-primary" />
              <span>HandyConnect</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href}>
                    <SidebarMenuButton className="w-full justify-start" isActive={pathname === item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <SidebarMenu>
                {footerNavItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                        <Link href={item.href}>
                            <SidebarMenuButton className="w-full justify-start">
                                <item.icon className="h-5 w-5" /><span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1 min-h-screen">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden md:block font-headline text-xl">HandyConnect</div>
            <div className="flex items-center gap-2">
              <NotificationsPopover />
              <UserNav />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 overflow-y-auto">
            {children}
          </main>
          <AppFooter />
          <MobileFooter navItems={mainNavItems} />
        </SidebarInset>
      </SidebarProvider>
  );
}

// This component is the "gatekeeper" that decides what to render
function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait until the initial auth check is done

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isLoggedIn && isAuthPage) {
      router.push('/dashboard');
    }

    if (!isLoggedIn && !isAuthPage) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, pathname, router]);


  // While the initial auth check is happening, show a full-page loader.
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  // If the user is logged in, show the main app layout.
  // Otherwise, if they are on an auth page, show that page's content.
  if (isLoggedIn) {
    return <AppLayout>{children}</AppLayout>;
  } else {
    return <>{children}</>;
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <RootLayoutContent>{children}</RootLayoutContent>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}