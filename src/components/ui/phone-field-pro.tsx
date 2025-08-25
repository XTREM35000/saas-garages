import React, { useState, useEffect } from "react";
import { Phone, ChevronDown } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import {
  parsePhoneNumber,
  formatPhoneForDisplay,
  formatPhoneForStorage,
  getCountryOptions,
  COUNTRY_CODES,
  PhoneNumber
} from "@/utils/phoneUtils";

interface PhoneFieldProProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (countryCode: string) => void;
  countryCode?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showCountrySelect?: boolean;
  onValidationChange?: (valid: boolean) => void;
}

export const PhoneFieldPro: React.FC<PhoneFieldProProps> = ({
  label = "Téléphone",
	value,
	onChange,
  onCountryChange,
  countryCode = "FR",
	error,
  disabled = false,
  placeholder,
  required = false,
  className = "",
  showCountrySelect = true,
  onValidationChange
}) => {
  const [isValid, setIsValid] = useState<boolean>(true);
  const [touched, setTouched] = useState<boolean>(false);
  const [parsedPhone, setParsedPhone] = useState<PhoneNumber | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Parser le numéro de téléphone
	useEffect(() => {
		if (value) {
      const parsed = parsePhoneNumber(value, countryCode);
      setParsedPhone(parsed);
      setIsValid(parsed.isValid);
      onValidationChange?.(parsed.isValid);
    } else {
      setParsedPhone(null);
      setIsValid(!required);
      onValidationChange?.(!required);
    }
  }, [value, countryCode, required, onValidationChange]);

  // Gestion du changement de valeur
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Ne pas ajouter l'indicatif automatiquement car il y a déjà un sélecteur de pays
    // Juste nettoyer le numéro et le passer directement
    const cleanValue = newValue.replace(/[^\d]/g, '');
    onChange(cleanValue);

    if (touched) {
      const parsed = parsePhoneNumber(cleanValue, countryCode);
      setIsValid(parsed.isValid);
      onValidationChange?.(parsed.isValid);
    }
  };

  // Gestion de la perte de focus
  const handleBlur = () => {
    setTouched(true);
    const parsed = parsePhoneNumber(value, countryCode);
    setIsValid(parsed.isValid);
    onValidationChange?.(parsed.isValid);
  };

  // Gestion du changement de pays
  const handleCountryChange = (newCountryCode: string) => {
    onCountryChange?.(newCountryCode);
    setShowCountryDropdown(false);
    
    // Ne pas reformater automatiquement, garder le numéro tel quel
    // L'indicatif sera géré par le sélecteur de pays
  };

  // Obtenir le placeholder selon le pays
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    const country = COUNTRY_CODES[countryCode as keyof typeof COUNTRY_CODES];
    if (!country) return "Numéro de téléphone";
    
    switch (countryCode) {
      case 'FR':
        return "06 12 34 56 78";
      case 'CI':
      case 'SN':
      case 'ML':
      case 'BF':
      case 'NE':
      case 'TG':
      case 'BJ':
      case 'CM':
      case 'TD':
      case 'CF':
      case 'GA':
      case 'CG':
      case 'CD':
      case 'GQ':
      case 'ST':
      case 'GW':
      case 'GN':
      case 'MR':
      case 'GM':
      case 'SL':
      case 'LR':
      case 'GH':
      case 'NG':
        return "07 12 34 56 78";
      default:
        return "Numéro de téléphone";
    }
  };

  const showError = touched && !isValid;
  const hasError = error || showError;
  const currentCountry = COUNTRY_CODES[countryCode as keyof typeof COUNTRY_CODES];

	return (
    <div className={cn("space-y-2", className)}>
			{label && (
        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
				</Label>
			)}

      <div className="flex items-center gap-2">
        {showCountrySelect && (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
					disabled={disabled}
              className="flex items-center gap-2 min-w-[120px] justify-between"
            >
              <span className="text-lg">{currentCountry?.flag || '🌍'}</span>
              <span className="text-xs">{currentCountry?.code || '+33'}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>

            {showCountryDropdown && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                {getCountryOptions().map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleCountryChange(option.value)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="text-lg">{option.label.split(' ')[0]}</span>
                    <span className="text-sm text-gray-600">{option.label.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative flex-1">
				<Input
            id="phone"
					type="tel"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={getPlaceholder()}
					disabled={disabled}
					className={cn(
              "transition-all duration-200",
              hasError
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
              disabled && "bg-gray-50 cursor-not-allowed"
            )}
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
			</div>

      {/* Messages d'erreur */}
      {hasError && (
        <p className="text-xs text-red-500">
          {error || "Format de téléphone invalide"}
        </p>
      )}

      {/* Aide format */}
      {!hasError && !value && (
        <p className="text-gray-500 text-xs">
          Format accepté : {getPlaceholder()}
				</p>
			)}

      {/* Informations sur le format de stockage */}
      {parsedPhone && (
        <div className="text-xs text-gray-500">
          <p>Stockage : {parsedPhone.formattedStorage}</p>
          <p>Pays : {currentCountry?.name || 'Inconnu'}</p>
        </div>
      )}
		</div>
  );
};

export default PhoneFieldPro;


