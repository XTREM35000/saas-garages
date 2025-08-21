import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppFormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  disabled?: boolean;
  className?: string;
  showValidation?: boolean;
}

export const WhatsAppFormField: React.FC<WhatsAppFormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  isValid,
  disabled = false,
  className = '',
  showValidation = true
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-2", className)}
    >
      {/* Label */}
      <label className="block text-[#128C7E] font-semibold text-sm">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Champ de saisie */}
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full p-4 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 pr-12",
            error
              ? "border-red-500 focus:ring-red-500/20"
              : isFocused
              ? "border-[#128C7E] focus:ring-[#128C7E]/20"
              : "border-[#128C7E]/30 focus:ring-[#128C7E]/20",
            disabled && "bg-gray-100 cursor-not-allowed opacity-60"
          )}
        />

        {/* Bouton toggle password pour les champs password */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Indicateur de validation */}
        {showValidation && isValid && value && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}

        {/* Indicateur d'erreur */}
        {showValidation && error && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm text-red-500 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};
