import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'icloud' | 'whatsapp';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('whatsapp');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('garage-theme', newTheme);
    document.body.className = document.body.className.replace(/\b(icloud|whatsapp)\b/g, '');
    document.body.classList.add(newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('garage-theme') as Theme;
    if (savedTheme && ['icloud', 'whatsapp'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};