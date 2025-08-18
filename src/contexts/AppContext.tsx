import React, { createContext, useContext, useEffect, useState } from 'react';
import { TypedSupabaseClient } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'icloud' | 'whatsapp';

export interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentStep: string;
  setCurrentStep: (step: string) => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  supabase: TypedSupabaseClient;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('icloud');
  const [currentStep, setCurrentStep] = useState('loading');
  const [currentUser, setCurrentUser] = useState(null);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('garage-theme', newTheme);

    // Apply theme to body
    const body = document.body;
    body.className = body.className.replace(/\b(icloud|whatsapp)\b/g, '');
    body.classList.add(newTheme);
  };

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('garage-theme') as Theme;
    if (savedTheme && ['icloud', 'whatsapp'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      setTheme('icloud');
    }
  }, []);

  const value = {
    theme,
    setTheme,
    currentStep,
    setCurrentStep,
    currentUser,
    setCurrentUser,
    supabase, // Instance Supabase importée
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

