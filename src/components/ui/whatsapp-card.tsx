import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WhatsAppCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  gradient?: boolean;
}

export const WhatsAppCard: React.FC<WhatsAppCardProps> = ({
  children,
  className = '',
  hover = true,
  shadow = 'md',
  border = true,
  gradient = false
}) => {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const baseClasses = cn(
    'bg-white rounded-2xl overflow-hidden transition-all duration-200',
    shadowClasses[shadow],
    border && 'border border-gray-200',
    gradient && 'bg-gradient-to-br from-white to-gray-50',
    hover && 'hover:shadow-xl hover:-translate-y-1',
    className
  );

  return (
    <motion.div
      className={baseClasses}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Composant pour l'en-tête de carte
export const WhatsAppCardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}> = ({ children, className = '', gradient = false }) => (
  <div className={cn(
    'p-6',
    gradient
      ? 'bg-gradient-to-r from-[#128C7E] to-[#075E54] text-white'
      : 'bg-gray-50 border-b border-gray-200',
    className
  )}>
    {children}
  </div>
);

// Composant pour le contenu de carte
export const WhatsAppCardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}> = ({ children, className = '', padding = 'md' }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={cn(paddingClasses[padding], className)}>
      {children}
    </div>
  );
};

// Composant pour le pied de carte
export const WhatsAppCardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={cn('p-6 bg-gray-50 border-t border-gray-200', className)}>
    {children}
  </div>
);
