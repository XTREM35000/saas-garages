import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { Mail } from 'lucide-react';

interface EmailFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  showIcon?: boolean;
  domains?: string[];
  allowCustomDomain?: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  value = '',
  onChange,
  className,
  error,
  label,
  showIcon = true,
  domains = ['gmail.com', 'outlook.com', 'yahoo.com'],
  allowCustomDomain = true,
  ...props
}) => {
  const [localPart, setLocalPart] = useState('');
  const [domain, setDomain] = useState(domains[0]);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');

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

  const handleLocalPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Empêcher la saisie du caractère "@"
    const newValue = e.target.value.replace('@', '');
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
          error ? "text-red-500" : "text-muted-foreground",
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
                error ? "border-red-500 focus-visible:ring-red-500" : ""
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
                error ? "border-red-500" : "border-input"
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
                error ? "border-red-500" : "border-input"
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
                error ? "border-red-500" : ""
              )}
              placeholder="domaine.com"
            />
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};