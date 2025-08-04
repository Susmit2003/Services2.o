"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '@/lib/actions/user.actions';
import type { UserProfile } from '@/types';

interface AuthContextType {
    currentUser: UserProfile | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    refetchUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    isLoggedIn: false,
    isLoading: true,
    refetchUser: async () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Handle client-side mounting
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const refetchUser = useCallback(async () => {
        if (!isMounted) return;

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            console.log('🔍 Checking token:', token ? 'Token exists' : 'No token');
            if (token) {
                console.log('🔍 Token value (first 20 chars):', token.substring(0, 20) + '...');
            }
            
            if (!token) {
                console.log('❌ No token found, setting user to null');
                setCurrentUser(null);
                setIsLoading(false);
                return;
            }

            console.log('✅ Token found, fetching user profile...');
            const user = await getUserProfile();
            console.log('✅ User profile fetched:', user ? 'Success' : 'Failed');
            if (user) {
                console.log('✅ User details:', { id: user.id, name: user.name, mobile: user.mobile });
            }
            setCurrentUser(user as UserProfile | null);
        } catch (error) {
            console.error("❌ Failed to refetch user", error);
            if (error instanceof Error && error.message.includes('Not authorized')) {
                console.log('❌ Token is invalid, removing from localStorage');
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                }
            }
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [isMounted]);

    const logout = useCallback(() => {
        console.log('🚪 Logging out user');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
        setCurrentUser(null);
        setIsLoading(false);
    }, []);

    // Initial load - check for existing token
    useEffect(() => {
        if (isMounted) {
            console.log('🚀 Initial auth check - mounted:', isMounted);
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            console.log('🔍 Initial token check:', token ? 'Token exists' : 'No token');
            
            if (token) {
                console.log('✅ Token found on initial load, fetching user...');
                setIsLoading(true);
                refetchUser();
            } else {
                console.log('❌ No token on initial load, setting loading to false');
                setIsLoading(false);
            }
        }
    }, [isMounted, refetchUser]);

    const value = {
        currentUser,
        isLoggedIn: !!currentUser,
        isLoading,
        refetchUser,
        logout,
    };

    console.log('🔄 Auth context state:', {
        currentUser: currentUser ? 'User exists' : 'No user',
        isLoggedIn: !!currentUser,
        isLoading,
        isMounted
    });

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

