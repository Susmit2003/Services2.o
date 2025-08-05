"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, loginUser, logoutUser as logoutAction } from '@/lib/actions/user.actions';
import Cookies from 'js-cookie'; // Using js-cookie for robust client-side cookie management
import type { UserProfile, LoginData } from '@/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // To avoid SSR issues with initial auth check
  const router = useRouter();

  const fetchProfileOnLoad = useCallback(async () => {
    // Read the token from cookies. This works on the client-side.
    // Server-side actions will read this token directly from request headers.
    const token = Cookies.get('authToken');
    
    if (token) {
      try {
        // This server action will read the cookie on the server-side
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
    // This ensures the auth check runs only on the client after the component has mounted
    if (!isMounted) {
      setIsMounted(true);
      fetchProfileOnLoad();
    }
  }, [isMounted, fetchProfileOnLoad]);

  const login = async (loginData: LoginData) => {
    try {
      const response = await loginUser(loginData);
      if (response && response.token) {
        // Set the auth token in a cookie. It will be sent automatically to the server on subsequent requests.
        // `secure: true` should be used in production with HTTPS.
        Cookies.set('authToken', response.token, { expires: 7, path: '/', secure: process.env.NODE_ENV === 'production' });
        
        // The response from loginUser already contains the user profile
        setCurrentUser(response);
      } else {
        throw new Error("Login response did not include a token.");
      }
    } catch (error) {
      // On failed login, ensure any stray cookies are removed
      Cookies.remove('authToken');
      setCurrentUser(null);
      // Re-throw the error so the login page can display it to the user
      throw error;
    }
  };

  const logout = () => {
    logoutAction(); // This is a placeholder server action
    Cookies.remove('authToken');
    setCurrentUser(null);
    // Use router.replace for a cleaner history stack
    router.replace('/login');
  };

  // Display a full-page loader while the initial authentication check is running
  // This prevents the "flicker" of content or redirects.
  if (!isMounted || isLoading) {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    isLoading, // This will now be false for all children components
    login,
    logout,
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