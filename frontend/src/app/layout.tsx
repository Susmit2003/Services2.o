"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
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
import { LoadingProvider, useLoading } from '@/context/loading-context';

// Main application layout for LOGGED-IN users
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

// Gatekeeper component
function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const { isLoading: globalLoading } = useLoading(); // Use global loader
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (isLoggedIn && isAuthPage) {
      router.push('/dashboard');
    } else if (!isLoggedIn && !isAuthPage) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, pathname, router]);

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <>
      {/* Only wrap with AppLayout if logged in and not on auth pages */}
      {isLoggedIn && !isAuthPage ? (
        <AppLayout>{children}</AppLayout>
      ) : (
        children
      )}
      {/* Show global loader if any API call is loading */}
      {globalLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      )}
      {/* Optionally, keep the auth loading spinner for initial auth state */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <LoadingProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AuthProvider>
              <RootLayoutContent>{children}</RootLayoutContent>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}