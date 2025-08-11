"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, loginUser as loginAction, logoutUser as logoutAction } from '@/lib/actions/user.actions';
import { initializeFirebaseMessaging, onMessageListener } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, LoginData } from '@/types';
import { MessagePayload } from 'firebase/messaging'; // Import the type from firebase

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    try {
      const user = await getUserProfile();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  useEffect(() => {
    if (currentUser) {
      initializeFirebaseMessaging();

      // --- THIS IS THE FIX ---
      // We are now correctly typing the 'payload' as 'MessagePayload'
      onMessageListener().then((payload: MessagePayload) => {
        if (payload.notification) {
          toast({
            title: payload.notification.title,
            description: payload.notification.body,
          });
          router.refresh();
        }
      }).catch(err => console.error('Failed to listen for messages', err));
    }
  }, [currentUser, toast, router]);

  const login = async (loginData: LoginData) => {
    try {
      await loginAction(loginData);
      await fetchUser();
    } catch (error) {
      setCurrentUser(null);
      throw error;
    }
  };

  const logout = async () => {
    await logoutAction(); 
    setCurrentUser(null);
  };
  
  const refetchUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);
  
  const value = { currentUser, isLoggedIn: !!currentUser, isLoading, login, logout, refetchUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};