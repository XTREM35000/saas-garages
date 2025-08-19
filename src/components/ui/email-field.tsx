import React, { useState, useEffect, useCallback } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { Mail } from 'lucide-react';

// Définition des domaines par défaut
const DEFAULT_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

interface EmailFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  showIcon?: boolean;
  domains?: string[]; // Ajout de la prop domains
  allowCustomDomain?: boolean;
  required?: boolean;
  disabled?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  value = '',
  onChange,
  error: externalError,
  label,
  required,
  disabled,
  className,
  domains = DEFAULT_DOMAINS, // Utilisation des domaines par défaut
  allowCustomDomain = true,
  showIcon = true,
  onValidationChange,
  ...props
}) => {
  const [localPart, setLocalPart] = useState('');
  const [domain, setDomain] = useState(domains[0]);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [internalError, setInternalError] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  // Initialise l'email à partir de la valeur fournie
  useEffect(() => {
    if (value) {
      const [local, emailDomain] = value.split('@');
      setLocalPart(local || '');

      if (emailDomain) {
        if (domains.includes(emailDomain)) {
          setDomain(emailDomain);
          setIsCustomDomain(false);
        } else {
          setCustomDomain(emailDomain);
          setIsCustomDomain(true);
        }
      }
    }
  }, [value, domains]);

  // Validation de l'email
  const validateEmail = useCallback((email: string): boolean => {
    if (!required && !email) return true;
    if (required && !email) {
      setInternalError('Email requis');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      setInternalError('Format email invalide');
      return false;
    }

    setInternalError('');
    return true;
  }, [required]);

  // Effet pour la validation
  useEffect(() => {
    const valid = validateEmail(value);
    setIsValid(valid);
    onValidationChange?.(valid);
  }, [value, validateEmail, onValidationChange]);

  const handleLocalPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Empêcher la saisie du caractère "@"
    const newValue = e.target.value.replace(/@/g, '');

    setLocalPart(newValue);
    updateEmail(newValue, isCustomDomain ? customDomain : domain);
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDomain = e.target.value;
    if (newDomain === 'custom') {
      setIsCustomDomain(true);
    } else {
      setIsCustomDomain(false);
      setDomain(newDomain);
      updateEmail(localPart, newDomain);
    }
  };

  const handleCustomDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomDomain = e.target.value;
    setCustomDomain(newCustomDomain);
    updateEmail(localPart, newCustomDomain);
  };

  const updateEmail = (local: string, emailDomain: string) => {
    if (local && emailDomain) {
      onChange?.(`${local}@${emailDomain}`);
    } else {
      onChange?.('');
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center space-x-2">
          {showIcon && <Mail className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}

      <div className="relative">
        <div className={cn(
          "flex items-center gap-1",
          (externalError || internalError) ? "text-red-500" : "text-muted-foreground",
          className
        )}>
          <div className="flex-1">
            <Input
              {...props}
              type="text"
              value={localPart}
              onChange={handleLocalPartChange}
              className={cn(
                "border",
                (externalError || internalError) ? "border-red-500 focus-visible:ring-red-500" : ""
              )}
              placeholder="votre.nom"
            />
          </div>

          <span>@</span>

          {allowCustomDomain ? (
            <select
              value={isCustomDomain ? 'custom' : domain}
              onChange={handleDomainChange}
              className={cn(
                "h-10 rounded-md border bg-background px-3",
                (externalError || internalError) ? "border-red-500" : "border-input"
              )}
            >
              {domains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
              <option value="custom">Autre</option>
            </select>
          ) : (
            <select
              value={domain}
              onChange={handleDomainChange}
              className={cn(
                "h-10 rounded-md border bg-background px-3",
                (externalError || internalError) ? "border-red-500" : "border-input"
              )}
            >
              {domains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {isCustomDomain && (
            <Input
              type="text"
              value={customDomain}
              onChange={handleCustomDomainChange}
              className={cn(
                "border",
                (externalError || internalError) ? "border-red-500" : ""
              )}
              placeholder="domaine.com"
            />
          )}
        </div>

        {(externalError || internalError) && (
          <p className="mt-1 text-xs text-red-500">{externalError || internalError}</p>
        )}
      </div>
    </div>
  );
};