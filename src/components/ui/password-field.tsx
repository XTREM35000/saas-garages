import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Eye, EyeOff, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrength {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
  showStrengthIndicator?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  label = "",
  error,
  required = true,
  disabled,
  className,
  onValidationChange,
  showStrengthIndicator = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>({
    isValid: false,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (password: string): PasswordStrength => {
    const result = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isValid: false,
    };

    result.isValid = Object.entries(result)
      .filter(([key]) => key !== 'isValid')
      .every(([_, value]) => value);

    return result;
  };

  useEffect(() => {
    const newStrength = validatePassword(value);
    setStrength(newStrength);
    onValidationChange?.(newStrength.isValid);
  }, [value, onValidationChange]);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          <span>{label}</span>
        </Label>
      )}

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className={cn(
            "pr-10",
            error ? "border-red-500" : "",
            className
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {showStrengthIndicator && (
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            {Object.entries(strength)
              .filter(([key]) => key !== 'isValid')
              .map(([key, isValid]) => (
                <div
                  key={key}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    isValid ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              ))}
          </div>
          <ul className="space-y-1 text-xs text-gray-500">
            <li className={strength.hasMinLength ? "text-green-500" : ""}>
              • Au moins 8 caractères
            </li>
            <li className={strength.hasUpperCase ? "text-green-500" : ""}>
              • Une majuscule
            </li>
            <li className={strength.hasLowerCase ? "text-green-500" : ""}>
              • Une minuscule
            </li>
            <li className={strength.hasNumber ? "text-green-500" : ""}>
              • Un chiffre
            </li>
            <li className={strength.hasSpecialChar ? "text-green-500" : ""}>
              • Un caractère spécial
            </li>
          </ul>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};