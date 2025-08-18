import React from 'react';
import { Button } from '@/components/ui/button';
import { Apple, MessageSquare } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { theme, setTheme } = useApp();

  const toggleTheme = () => {
    setTheme(theme === 'icloud' ? 'whatsapp' : 'icloud');
  };

  const sizes = {
    sm: 'h-8 w-16',
    md: 'h-10 w-20', 
    lg: 'h-12 w-24'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className={`${sizes[size]} relative overflow-hidden transition-all duration-300 border-2 ${className}`}
      style={{
        backgroundColor: theme === 'icloud' ? '#007aff' : '#25d366',
        borderColor: theme === 'icloud' ? '#007aff' : '#25d366',
        color: 'white'
      }}
    >
      <div className="flex items-center justify-between w-full px-1">
        <Apple className={`${iconSizes[size]} ${theme === 'icloud' ? 'opacity-100' : 'opacity-30'} transition-opacity`} />
        <MessageSquare className={`${iconSizes[size]} ${theme === 'whatsapp' ? 'opacity-100' : 'opacity-30'} transition-opacity`} />
      </div>
      
      {/* Sliding indicator */}
      <div 
        className="absolute top-1/2 transform -translate-y-1/2 bg-white rounded-full transition-all duration-300"
        style={{
          width: `calc(50% - 4px)`,
          height: `calc(100% - 4px)`,
          left: theme === 'icloud' ? '2px' : 'calc(50% + 2px)',
        }}
      />
    </Button>
  );
};

export default ThemeToggle;