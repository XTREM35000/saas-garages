import React from 'react';
import { Label } from './label';
import { Input } from './input';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ModalFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  isValid?: boolean;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const ModalFormField: React.FC<ModalFormFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  isValid,
  disabled = false,
  required = false,
  icon,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={id}
        className="modal-label flex items-center gap-2"
      >
        {icon && <span className="text-green-600">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            modal-input
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${isValid && !error ? 'border-green-500 focus:ring-green-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {/* Indicateur de validation */}
        {isValid && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        )}

        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="modal-error">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* Message de succès */}
      {isValid && !error && (
        <p className="modal-success">
          <CheckCircle className="w-3 h-3" />
          Champ valide
        </p>
      )}
    </div>
  );
};
