import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { Phone } from 'lucide-react';

interface PhonePrefix {
  code: string;
  country: string;
  prefix: string;
  format: string;
  minLength: number;
  maxLength: number;
}

const PHONE_PREFIXES: PhonePrefix[] = [
  { code: 'FR', country: 'France', prefix: '+33', format: 'XX XX XX XX XX', minLength: 11, maxLength: 11 },
  { code: 'CI', country: 'Côte d\'Ivoire', prefix: '+225', format: 'XX XX XX XX XX', minLength: 10, maxLength: 10 },
  { code: 'BF', country: 'Burkina Faso', prefix: '+226', format: 'XX XX XX XX', minLength: 8, maxLength: 8 },
  { code: 'SN', country: 'Sénégal', prefix: '+221', format: 'XX XXX XX XX', minLength: 9, maxLength: 9 },
  { code: 'CM', country: 'Cameroun', prefix: '+237', format: 'XX XX XX XX', minLength: 8, maxLength: 8 },
  { code: 'LB', country: 'Liban', prefix: '+961', format: 'XX XXX XXX', minLength: 7, maxLength: 8 },
  { code: 'DZ', country: 'Algérie', prefix: '+213', format: 'XX XXX XX XX', minLength: 9, maxLength: 9 },
  { code: 'TG', country: 'Togo', prefix: '+228', format: 'XX XX XX XX', minLength: 8, maxLength: 8 },
  { code: 'BJ', country: 'Bénin', prefix: '+229', format: 'XX XX XX XX', minLength: 8, maxLength: 8 },
];

const PHONE_PATTERNS: Record<string, { regex: RegExp, minLength: number, maxLength: number }> = {
  '+33': { regex: /^(\+33|0)[1-9]([\s.-]*\d{2}){4}$/, minLength: 11, maxLength: 11 },
  '+225': { regex: /^(\+225|00225)?[0-9]{8}$/, minLength: 10, maxLength: 10 },
  '+226': { regex: /^(\+226|00226)?[0-9]{8}$/, minLength: 8, maxLength: 8 },
  '+221': { regex: /^(\+221|00221)?[0-9]{9}$/, minLength: 9, maxLength: 9 },
  '+237': { regex: /^(\+237|00237)?[0-9]{9}$/, minLength: 9, maxLength: 9 },
  '+961': { regex: /^(\+961|00961)?[0-9]{7,8}$/, minLength: 7, maxLength: 8 },
  '+213': { regex: /^(\+213|00213)?[0-9]{9}$/, minLength: 9, maxLength: 9 },
  '+228': { regex: /^(\+228|00228)?[0-9]{8}$/, minLength: 8, maxLength: 8 },
  '+229': { regex: /^(\+229|00229)?[0-9]{8}$/, minLength: 8, maxLength: 8 },
};

interface PhoneFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

interface ValidationStatus {
  isValid: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  value = '',
  onChange,
  error: externalError,
  label,
  required,
  disabled,
  className,
  onValidationChange
}) => {
  const [prefix, setPrefix] = useState(PHONE_PREFIXES[0].prefix);
  const [number, setNumber] = useState('');
  const [internalError, setInternalError] = useState<string>('');
  const [currentFormat, setCurrentFormat] = useState(PHONE_PREFIXES[0].format);

  // Fonction pour formater le numéro selon le format du pays
  const formatPhoneNumber = (input: string, format: string): string => {
    const digits = input.replace(/\D/g, '');
    if (!digits) return '';

    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < format.length; i++) {
      if (digitIndex >= digits.length) break;

      if (format[i] === 'X') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
      }
    }

    return formatted;
  };

  // Fonction de validation du numéro
  const validatePhoneNumber = (prefix: string, num: string): ValidationStatus => {
    if (!required && !num) {
      return { isValid: true, message: '', type: 'info' };
    }

    if (required && !num) {
      return {
        isValid: false,
        message: 'Numéro de téléphone requis',
        type: 'error'
      };
    }

    const cleanNum = num.replace(/\D/g, '');
    const pattern = PHONE_PATTERNS[prefix];
    const prefixInfo = PHONE_PREFIXES.find(p => p.prefix === prefix);

    if (!pattern || !prefixInfo) {
      return {
        isValid: false,
        message: 'Pays non supporté',
        type: 'error'
      };
    }

    // Validation de la longueur
    if (cleanNum.length < pattern.minLength) {
      return {
        isValid: false,
        message: `${prefixInfo.country}: ${cleanNum.length}/${pattern.minLength} chiffres requis`,
        type: 'info'
      };
    }

    if (cleanNum.length > pattern.maxLength) {
      return {
        isValid: false,
        message: `${prefixInfo.country}: maximum ${pattern.maxLength} chiffres`,
        type: 'error'
      };
    }

    // Validation du format
    const isValidFormat = pattern.regex.test(`${prefix}${cleanNum}`);
    if (!isValidFormat) {
      return {
        isValid: false,
        message: `Format invalide pour ${prefixInfo.country}`,
        type: 'error'
      };
    }

    // Numéro valide
    return {
      isValid: true,
      message: cleanNum.length === pattern.maxLength
        ? '✓ Numéro valide'
        : `Saisie en cours: ${cleanNum.length}/${pattern.maxLength}`,
      type: cleanNum.length === pattern.maxLength ? 'success' : 'info'
    };
  };

  useEffect(() => {
    if (value) {
      const matchedPrefix = PHONE_PREFIXES.find(p => value.startsWith(p.prefix));
      if (matchedPrefix) {
        setPrefix(matchedPrefix.prefix);
        const numberPart = value.slice(matchedPrefix.prefix.length).trim();
        setNumber(numberPart);
        setCurrentFormat(matchedPrefix.format);
      }
    }
  }, [value]);

  useEffect(() => {
    const { isValid } = validatePhoneNumber(prefix, number);
    onValidationChange?.(isValid);
  }, [prefix, number, required, onValidationChange]);

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefix = e.target.value;
    const newPrefixInfo = PHONE_PREFIXES.find(p => p.prefix === newPrefix);

    if (newPrefixInfo) {
      setPrefix(newPrefix);
      setCurrentFormat(newPrefixInfo.format);

      // Limiter le nombre de chiffres selon le nouveau pays
      const cleanNumber = number.replace(/\D/g, '');
      const limitedNumber = cleanNumber.slice(0, newPrefixInfo.maxLength);
      const formattedNumber = formatPhoneNumber(limitedNumber, newPrefixInfo.format);

      setNumber(formattedNumber);
      updatePhone(newPrefix, formattedNumber);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cleanInput = input.replace(/\D/g, '');
    const prefixInfo = PHONE_PREFIXES.find(p => p.prefix === prefix);

    if (!prefixInfo) return;

    // Empêcher la saisie au-delà de la longueur maximale
    if (cleanInput.length > prefixInfo.maxLength) {
      return;
    }

    const formattedNumber = formatPhoneNumber(cleanInput, currentFormat);
    setNumber(formattedNumber);
    updatePhone(prefix, formattedNumber);
  };

  const updatePhone = (selectedPrefix: string, phoneNumber: string) => {
    if (onChange) {
      onChange(`${selectedPrefix} ${phoneNumber}`.trim());
    }
  };

  // Afficher soit l'erreur externe, soit l'erreur interne
  const displayError = externalError || internalError;

  // Obtenir les informations du préfixe actuel
  const currentPrefixInfo = PHONE_PREFIXES.find(p => p.prefix === prefix);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="flex gap-2">
        <select
          value={prefix}
          onChange={handlePrefixChange}
          disabled={disabled}
          className={cn(
            "h-10 rounded-md border bg-background px-3 py-2 min-w-[120px]",
            displayError ? "border-red-500" : "border-input",
            "text-sm",
            className
          )}
        >
          {PHONE_PREFIXES.map(({ code, country, prefix }) => (
            <option key={code} value={prefix}>
              {code} ({prefix})
            </option>
          ))}
        </select>

        <div className="flex-1 relative">
          <Input
            type="tel"
            value={number}
            onChange={handleNumberChange}
            disabled={disabled}
            required={required}
            placeholder={currentPrefixInfo?.format || 'Numéro de téléphone'}
            maxLength={currentFormat.length} // Limite physique de saisie
            className={cn(
              displayError ? "border-red-500" : "",
              "pr-20",
              className
            )}
          />
          {currentPrefixInfo && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
              {number.replace(/\D/g, '').length}/{currentPrefixInfo.maxLength}
            </div>
          )}
        </div>
      </div>

      {displayError && (
        <p className={cn(
          "text-sm mt-1",
          {
            'text-green-500': displayError.startsWith('✓'),
            'text-blue-500': displayError.includes('Saisie en cours'),
            'text-red-500': !displayError.startsWith('✓') && !displayError.includes('Saisie en cours')
          }
        )}>
          {displayError}
        </p>
      )}

      {currentPrefixInfo && !displayError && number && (
        <p className="text-xs text-muted-foreground">
          Format: {currentPrefixInfo.country} - {currentPrefixInfo.format}
        </p>
      )}
    </div>
  );
};