"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, loginUser, logoutUser as logoutAction } from '@/lib/actions/user.actions';
import Cookies from 'js-cookie';
import type { UserProfile, LoginData } from '@/types'; // <-- FIX: Import UserProfile
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const user = await getUserProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error("Session check failed, removing auth token.", error);
        Cookies.remove('authToken');
        setCurrentUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      fetchUser();
    }
  }, [isMounted, fetchUser]);

  const refetchUser = async () => {
      console.log("Refetching user profile...");
      setIsLoading(true);
      await fetchUser();
  };

  const login = async (loginData: LoginData) => {
    try {
      const response = await loginUser(loginData);
      if (response && response.token) {
        Cookies.set('authToken', response.token, { expires: 7, path: '/', secure: process.env.NODE_ENV === 'production' });
        setCurrentUser(response);
      } else {
        throw new Error("Login response did not include a token.");
      }
    } catch (error) {
      Cookies.remove('authToken');
      setCurrentUser(null);
      throw error;
    }
  };

  const logout = () => {
    logoutAction();
    Cookies.remove('authToken');
    setCurrentUser(null);
    router.replace('/login');
  };

  if (!isMounted) {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    isLoading,
    login,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};