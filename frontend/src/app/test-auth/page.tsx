"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';

export default function TestAuthPage() {
  const { currentUser, isLoading, isLoggedIn } = useAuth();
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageToken(localStorage.getItem('authToken'));
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Auth Context State:</h2>
          <pre className="mt-2 text-sm">
            {JSON.stringify({
              currentUser: currentUser ? 'User exists' : 'No user',
              isLoading,
              isLoggedIn,
              hasUser: !!currentUser
            }, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">LocalStorage Token:</h2>
          <pre className="mt-2 text-sm">
            {localStorageToken ? `Token exists: ${localStorageToken.substring(0, 20)}...` : 'No token'}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">User Details:</h2>
          <pre className="mt-2 text-sm">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 