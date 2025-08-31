"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingContext = createContext({
  isLoading: false,
  setLoading: (_: boolean) => {},
});

export const useLoading = () => useContext(LoadingContext);

let globalSetLoading: ((loading: boolean) => void) | null = null;

export const setGlobalLoadingSetter = (setter: (loading: boolean) => void) => {
  globalSetLoading = setter;
};

export const triggerGlobalLoading = (loading: boolean) => {
  if (globalSetLoading) globalSetLoading(loading);
};

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setGlobalLoadingSetter(setLoading);
  }, []);

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