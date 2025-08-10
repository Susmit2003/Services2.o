"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, loginUser as loginAction, logoutUser as logoutAction } from '@/lib/actions/user.actions';
import Cookies from 'js-cookie';
import type { UserProfile, LoginData } from '@/types';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';

// --- THIS IS THE FIX ---
// 1. Add 'refetchUser' to the context's type definition.
interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    Cookies.set('authToken', token, { expires: 7, path: '/' });
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    Cookies.remove('authToken');
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const tokenExists = !!Cookies.get('authToken');
    if (tokenExists) {
      try {
        const user = await getUserProfile();
        setCurrentUser(user);
      } catch (error) {
        setAuthToken(null);
        setCurrentUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (loginData: LoginData) => {
    try {
      const response = await loginAction(loginData);
      if (response && response.user) {
        setCurrentUser(response.user as UserProfile);
      } else {
        throw new Error("Login failed: Invalid response from server.");
      }
    } catch (error) {
      setCurrentUser(null);
      throw error;
    }
  };

  const logout = async () => {
    await logoutAction(); 
    setCurrentUser(null);
  };
  
  // 2. Define the 'refetchUser' function.
  const refetchUser = useCallback(async () => {
      setIsLoading(true);
      await fetchUser();
  }, [fetchUser]);
  
  // 3. Add 'refetchUser' to the value provided by the context.
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