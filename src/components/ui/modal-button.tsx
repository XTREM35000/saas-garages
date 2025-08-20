import React from 'react';
import { Button } from './button';
import { Loader2 } from 'lucide-react';

interface ModalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const ModalButton: React.FC<ModalButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingText,
  icon,
  className = "",
  fullWidth = true
}) => {
  const baseClasses = "modal-button transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variantClasses = {
    primary: "modal-button-primary",
    secondary: "modal-button-secondary",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
  };

  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText || "Chargement..."}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {icon}
          {children}
        </span>
      )}
    </Button>
  );
};
