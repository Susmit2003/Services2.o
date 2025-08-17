import React, { createContext, useContext, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingContext = createContext({
  isLoading: false,
  setLoading: (_: boolean) => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      )}
    </LoadingContext.Provider>
  );
};