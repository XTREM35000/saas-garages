import { useState, useEffect } from 'react';
import {
  parsePhoneNumber,
  formatPhoneForDisplay,
  formatPhoneForStorage,
  validatePhoneNumber,
  PhoneNumber
} from '@/utils/phoneUtils';

interface UsePhoneNumberReturn {
  phoneNumber: PhoneNumber | null;
  displayValue: string;
  storageValue: string;
  isValid: boolean;
  countryCode: string;
  setPhoneNumber: (phone: string, country?: string) => void;
  setCountryCode: (country: string) => void;
  reset: () => void;
}

export const usePhoneNumber = (
  initialPhone?: string,
  initialCountry: string = 'FR'
): UsePhoneNumberReturn => {
  const [phoneNumber, setPhoneNumberState] = useState<PhoneNumber | null>(null);
  const [countryCode, setCountryCodeState] = useState<string>(initialCountry);

  // Initialiser avec les valeurs fournies
  useEffect(() => {
    if (initialPhone) {
      const parsed = parsePhoneNumber(initialPhone, initialCountry);
      setPhoneNumberState(parsed);
      setCountryCodeState(parsed.countryCode);
    }
  }, [initialPhone, initialCountry]);

  const setPhoneNumber = (phone: string, country: string = countryCode) => {
    const parsed = parsePhoneNumber(phone, country);
    setPhoneNumberState(parsed);
    setCountryCodeState(parsed.countryCode);
  };

  const setCountryCode = (country: string) => {
    setCountryCodeState(country);
    if (phoneNumber) {
      const reformatted = formatPhoneForDisplay(phoneNumber.formattedStorage, country);
      const parsed = parsePhoneNumber(reformatted, country);
      setPhoneNumberState(parsed);
    }
  };

  const reset = () => {
    setPhoneNumberState(null);
    setCountryCodeState(initialCountry);
  };

  return {
    phoneNumber,
    displayValue: phoneNumber?.formattedDisplay || '',
    storageValue: phoneNumber?.formattedStorage || '',
    isValid: phoneNumber?.isValid || false,
    countryCode,
    setPhoneNumber,
    setCountryCode,
    reset
  };
};

// Hook pour gérer plusieurs numéros de téléphone
export const usePhoneNumbers = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<Map<string, PhoneNumber>>(new Map());

  const addPhoneNumber = (key: string, phone: string, country: string = 'FR') => {
    const parsed = parsePhoneNumber(phone, country);
    setPhoneNumbers(prev => new Map(prev).set(key, parsed));
  };

  const removePhoneNumber = (key: string) => {
    setPhoneNumbers(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  const updatePhoneNumber = (key: string, phone: string, country?: string) => {
    const existing = phoneNumbers.get(key);
    const countryCode = country || existing?.countryCode || 'FR';
    const parsed = parsePhoneNumber(phone, countryCode);
    setPhoneNumbers(prev => new Map(prev).set(key, parsed));
  };

  const getPhoneNumber = (key: string): PhoneNumber | null => {
    return phoneNumbers.get(key) || null;
  };

  const getAllPhoneNumbers = (): PhoneNumber[] => {
    return Array.from(phoneNumbers.values());
  };

  const getValidPhoneNumbers = (): PhoneNumber[] => {
    return Array.from(phoneNumbers.values()).filter(phone => phone.isValid);
  };

  const clearAll = () => {
    setPhoneNumbers(new Map());
  };

  return {
    phoneNumbers: Array.from(phoneNumbers.entries()),
    addPhoneNumber,
    removePhoneNumber,
    updatePhoneNumber,
    getPhoneNumber,
    getAllPhoneNumbers,
    getValidPhoneNumbers,
    clearAll
  };
};

// Hook pour valider un numéro de téléphone
export const usePhoneValidation = (phone: string, country: string = 'FR') => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!phone) {
      setIsValid(false);
      setError('');
      return;
    }

    const parsed = parsePhoneNumber(phone, country);
    setIsValid(parsed.isValid);
    
    if (!parsed.isValid) {
      const countryInfo = country === 'FR' ? 'français' : 
                         country === 'CI' ? 'ivoirien' :
                         country === 'SN' ? 'sénégalais' : 'international';
      setError(`Format de numéro ${countryInfo} invalide`);
    } else {
      setError('');
    }
  }, [phone, country]);

  return { isValid, error };
};
