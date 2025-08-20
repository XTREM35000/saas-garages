import React, { useState, useEffect, useCallback } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface PhonePrefix {
  code: string;
  country: string;
  prefix: string;
  format: string;
}

const PHONE_PREFIXES: PhonePrefix[] = [
  { code: 'FR', country: 'France', prefix: '+33', format: 'X XX XX XX XX' },
  { code: 'CI', country: 'Côte d\'Ivoire', prefix: '+225', format: 'XX XX XX XX XX' },
  { code: 'MA', country: 'Maroc', prefix: '+212', format: 'X XX XX XX XX' },
  { code: 'SN', country: 'Sénégal', prefix: '+221', format: 'XX XXX XX XX' },
  { code: 'BF', country: 'Burkina Faso', prefix: '+226', format: 'XX XX XX XX' },
  { code: 'CM', country: 'Cameroun', prefix: '+237', format: 'X XX XX XX XX' },
  { code: 'TG', country: 'Togo', prefix: '+228', format: 'XX XX XX XX' },
  { code: 'BJ', country: 'Bénin', prefix: '+229', format: 'XX XX XX XX' },
];

const PHONE_PATTERNS: Record<string, { regex: RegExp, minLength: number, maxLength: number }> = {
  '+33': {
    regex: /^(\+33|0)[1-9](\d{2}){4}$/,
    minLength: 9,
    maxLength: 10
  },
  '+225': {
    regex: /^(\+225|00225)?\d{8}$/,
    minLength: 8,
    maxLength: 8
  },
  '+212': {
    regex: /^(\+212|0)[5-7]\d{8}$/,
    minLength: 9,
    maxLength: 10
  },
  '+221': {
    regex: /^(\+221|00221)?\d{9}$/,
    minLength: 9,
    maxLength: 9
  },
  '+226': {
    regex: /^(\+226|00226)?\d{8}$/,
    minLength: 8,
    maxLength: 8
  },
  '+237': {
    regex: /^(\+237|00237)?\d{9}$/,
    minLength: 9,
    maxLength: 9
  },
  '+228': {
    regex: /^(\+228|00228)?\d{8}$/,
    minLength: 8,
    maxLength: 8
  },
  '+229': {
    regex: /^(\+229|00229)?\d{8}$/,
    minLength: 8,
    maxLength: 8
  },
};

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  value = '',
  onChange,
  error: externalError,
  label = "Téléphone",
  required = false,
  disabled = false,
  className,
  onValidationChange
}) => {
  const [prefix, setPrefix] = useState(PHONE_PREFIXES[0].prefix);
  const [number, setNumber] = useState('');
  const [internalError, setInternalError] = useState<string>('');
  const [validationStatus, setValidationStatus] = useState<'error' | 'success' | 'info'>('info');

  const validatePhoneNumber = (prefix: string, num: string): boolean => {
    if (!required && !num) {
      setInternalError('');
      setValidationStatus('info');
      return true;
    }

    if (required && !num) {
      setInternalError('Numéro de téléphone requis');
      setValidationStatus('error');
      return false;
    }

    const cleanNum = num.replace(/\D/g, '');
    const pattern = PHONE_PATTERNS[prefix];
    const prefixInfo = PHONE_PREFIXES.find(p => p.prefix === prefix);

    if (!pattern || !prefixInfo) {
      setInternalError('Pays non supporté');
      setValidationStatus('error');
      return false;
    }

    if (cleanNum.length < pattern.minLength) {
      setInternalError(`${prefixInfo.country}: ${cleanNum.length}/${pattern.minLength} chiffres requis`);
      setValidationStatus('info');
      return false;
    }

    if (cleanNum.length > pattern.maxLength) {
      setInternalError(`${prefixInfo.country}: maximum ${pattern.maxLength} chiffres`);
      setValidationStatus('error');
      return false;
    }

    const isValidFormat = pattern.regex.test(`${prefix}${cleanNum}`);
    if (!isValidFormat) {
      setInternalError(`Format invalide pour ${prefixInfo.country}`);
      setValidationStatus('error');
      return false;
    }

    setInternalError('✓ Numéro valide');
    setValidationStatus('success');
    return true;
  };

  useEffect(() => {
    if (value) {
      const matchedPrefix = PHONE_PREFIXES.find(p => value.startsWith(p.prefix));
      if (matchedPrefix) {
        setPrefix(matchedPrefix.prefix);
        setNumber(value.slice(matchedPrefix.prefix.length).trim());
      }
    }
  }, [value]);

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefix = e.target.value;
    setPrefix(newPrefix);
    validateAndUpdate(newPrefix, number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d\s]/g, '');
    setNumber(newNumber);
    validateAndUpdate(prefix, newNumber);
  };

  const validateAndUpdate = (selectedPrefix: string, phoneNumber: string) => {
    const isValid = validatePhoneNumber(selectedPrefix, phoneNumber);
    onValidationChange?.(isValid);
    onChange(`${selectedPrefix} ${phoneNumber}`.trim());
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{label}</span>
        </Label>
      )}

      <div className="flex gap-2">
        <select
          value={prefix}
          onChange={handlePrefixChange}
          disabled={disabled}
          className={cn(
            "h-10 rounded-md border bg-background px-3 py-2",
            "text-sm focus:ring-2 focus:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed",
            externalError && "border-red-500",
            "w-[140px]"
          )}
        >
          {PHONE_PREFIXES.map(({ code, country, prefix }) => (
            <option key={code} value={prefix}>
              {country} ({prefix})
            </option>
          ))}
        </select>

        <Input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          disabled={disabled}
          required={required}
          placeholder={PHONE_PREFIXES.find(p => p.prefix === prefix)?.format}
          className={cn(
            validationStatus === 'error' && "border-red-500 focus:border-red-500",
            validationStatus === 'success' && "border-green-500 focus:border-green-500",
            className
          )}
        />
      </div>

      {(internalError || externalError) && (
        <p className={cn(
          "text-sm mt-1",
          validationStatus === 'error' && "text-red-500",
          validationStatus === 'success' && "text-green-500",
          validationStatus === 'info' && "text-blue-500"
        )}>
          {externalError || internalError}
        </p>
      )}
    </div>
  );
};
