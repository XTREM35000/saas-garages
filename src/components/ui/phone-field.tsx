import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

interface PhoneFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label = "Téléphone",
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "06 12 34 56 78",
  required = false,
  className = ""
}) => {
  const [isValid, setIsValid] = useState<boolean>(true);
  const [touched, setTouched] = useState<boolean>(false);

  // Validation du numéro de téléphone
  const validatePhone = (phone: string): boolean => {
    if (!phone) return !required; // Vide autorisé si pas requis
    return PHONE_REGEX.test(phone);
  };

  // Gestion du changement de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (touched) {
      setIsValid(validatePhone(newValue));
    }
  };

  // Gestion de la perte de focus
  const handleBlur = () => {
    setTouched(true);
    setIsValid(validatePhone(value));
  };

  // Validation initiale
  useEffect(() => {
    if (touched) {
      setIsValid(validatePhone(value));
    }
  }, [value, touched]);

  // Formatage automatique du numéro
  const formatPhoneNumber = (input: string): string => {
    // Supprimer tous les caractères non numériques sauf + et espace
    const cleaned = input.replace(/[^\d\s+]/g, '');

    // Si commence par 0, remplacer par +33
    if (cleaned.startsWith('0')) {
      return '+33 ' + cleaned.substring(1).replace(/(\d{2})(?=\d)/g, '$1 ');
    }

    // Si commence par +33, formater avec espaces
    if (cleaned.startsWith('+33')) {
      return cleaned.replace(/(\+33)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
    }

    // Si commence par 33, ajouter +
    if (cleaned.startsWith('33')) {
      return '+' + cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
    }

    // Sinon, formater avec espaces tous les 2 chiffres
    return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleChange({ ...e, target: { ...e.target, value: formatted } });
  };

  const showError = touched && !isValid;
  const hasError = error || showError;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="phone" className="modal-label flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-600" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id="phone"
          type="tel"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            modal-input pr-10 transition-all duration-200
            ${hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
          autoComplete="tel"
        />

        {/* Indicateur de validation */}
        {touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages d'erreur */}
      {hasError && (
        <p className="modal-error">
          {error || "Format de téléphone invalide (ex: 06 12 34 56 78)"}
        </p>
      )}

      {/* Aide format */}
      {!hasError && !value && (
        <p className="text-gray-500 text-xs">
          Format accepté : 06 12 34 56 78 ou +33 6 12 34 56 78
        </p>
      )}
    </div>
  );
}
