import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false
}) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-gradient-to-r from-[#128C7E] to-[#075E54] hover:from-[#075E54] hover:to-[#128C7E] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-[#128C7E]/50",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg focus:ring-gray-500/50",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500/50",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg focus:ring-yellow-500/50",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500/50",
    outline: "border-2 border-[#128C7E] text-[#128C7E] hover:bg-[#128C7E] hover:text-white focus:ring-[#128C7E]/50"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
    xl: "px-8 py-5 text-xl"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Chargement...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
