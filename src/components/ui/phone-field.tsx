import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { Phone } from 'lucide-react';

interface PhonePrefix {
  code: string;
  country: string;
  prefix: string;
}

const PHONE_PREFIXES: PhonePrefix[] = [
  { code: 'FR', country: 'France', prefix: '+33' },
  { code: 'CI', country: 'Côte d\'Ivoire', prefix: '+225' },
  { code: 'BF', country: 'Burkina Faso', prefix: '+226' },
  { code: 'SN', country: 'Sénégal', prefix: '+221' },
  { code: 'CM', country: 'Cameroun', prefix: '+237' },
  // Ajoutez d'autres pays selon vos besoins
];

interface PhoneFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  value = '',
  onChange,
  error,
  label,
  required,
  disabled,
  className
}) => {
  const [prefix, setPrefix] = useState(PHONE_PREFIXES[0].prefix);
  const [number, setNumber] = useState('');

  useEffect(() => {
    // Parse initial value if provided
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
    updatePhone(newPrefix, number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Accepter uniquement les chiffres et espaces
    const newNumber = e.target.value.replace(/[^\d\s]/g, '');
    setNumber(newNumber);
    updatePhone(prefix, newNumber);
  };

  const updatePhone = (selectedPrefix: string, phoneNumber: string) => {
    if (onChange) {
      onChange(`${selectedPrefix} ${phoneNumber}`.trim());
    }
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
            error ? "border-red-500" : "border-input",
            className
          )}
        >
          {PHONE_PREFIXES.map(({ code, country, prefix }) => (
            <option key={code} value={prefix}>
              {code} ({prefix})
            </option>
          ))}
        </select>

        <Input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          disabled={disabled}
          required={required}
          placeholder="XX XX XX XX XX"
          className={cn(
            error ? "border-red-500" : "",
            className
          )}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};