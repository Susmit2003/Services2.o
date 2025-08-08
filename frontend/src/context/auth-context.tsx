"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getUserProfile, loginUser as loginAction, logoutUser as logoutAction } from '@/lib/actions/user.actions';
import Cookies from 'js-cookie';
import type { UserProfile, LoginData } from '@/types';
import { Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        // If the token is invalid, clear it and the user state
        Cookies.remove('authToken');
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
        // The only job of this function is to update the state.
        // The redirect will be handled by the main layout.
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
    // The redirect is now handled by the main layout.
  };
  
  const value = { currentUser, isLoggedIn: !!currentUser, isLoading, login, logout };

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