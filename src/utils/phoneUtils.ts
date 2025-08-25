export interface PhoneNumber {
  countryCode: string;
  nationalNumber: string;
  formattedDisplay: string;
  formattedStorage: string;
  isValid: boolean;
}

export const COUNTRY_CODES = {
  FR: { code: '+33', name: 'France', flag: '🇫🇷' },
  CI: { code: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  SN: { code: '+221', name: 'Sénégal', flag: '🇸🇳' },
  ML: { code: '+223', name: 'Mali', flag: '🇲🇱' },
  BF: { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  NE: { code: '+227', name: 'Niger', flag: '🇳🇪' },
  TG: { code: '+228', name: 'Togo', flag: '🇹🇬' },
  BJ: { code: '+229', name: 'Bénin', flag: '🇧🇯' },
  CM: { code: '+237', name: 'Cameroun', flag: '🇨🇲' },
  TD: { code: '+235', name: 'Tchad', flag: '🇹🇩' },
  CF: { code: '+236', name: 'République centrafricaine', flag: '🇨🇫' },
  GA: { code: '+241', name: 'Gabon', flag: '🇬🇦' },
  CG: { code: '+242', name: 'Congo', flag: '🇨🇬' },
  CD: { code: '+243', name: 'République démocratique du Congo', flag: '🇨🇩' },
  GQ: { code: '+240', name: 'Guinée équatoriale', flag: '🇬🇶' },
  ST: { code: '+239', name: 'Sao Tomé-et-Principe', flag: '🇸🇹' },
  GW: { code: '+245', name: 'Guinée-Bissau', flag: '🇬🇼' },
  GN: { code: '+224', name: 'Guinée', flag: '🇬🇳' },
  MR: { code: '+222', name: 'Mauritanie', flag: '🇲🇷' },
  GM: { code: '+220', name: 'Gambie', flag: '🇬🇲' },
  SL: { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
  LR: { code: '+231', name: 'Libéria', flag: '🇱🇷' },
  GH: { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  NG: { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  DZ: { code: '+213', name: 'Algérie', flag: '🇩🇿' },
  TN: { code: '+216', name: 'Tunisie', flag: '🇹🇳' },
  LY: { code: '+218', name: 'Libye', flag: '🇱🇾' },
  EG: { code: '+20', name: 'Égypte', flag: '🇪🇬' },
  MA: { code: '+212', name: 'Maroc', flag: '🇲🇦' },
  SD: { code: '+249', name: 'Soudan', flag: '🇸🇩' },
  SS: { code: '+211', name: 'Soudan du Sud', flag: '🇸🇸' },
  ET: { code: '+251', name: 'Éthiopie', flag: '🇪🇹' },
  ER: { code: '+291', name: 'Érythrée', flag: '🇪🇷' },
  DJ: { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
  SO: { code: '+252', name: 'Somalie', flag: '🇸🇴' },
  KE: { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  TZ: { code: '+255', name: 'Tanzanie', flag: '🇹🇿' },
  UG: { code: '+256', name: 'Ouganda', flag: '🇺🇬' },
  BI: { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  RW: { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  MZ: { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  ZM: { code: '+260', name: 'Zambie', flag: '🇿🇲' },
  ZW: { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
  BW: { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  NA: { code: '+264', name: 'Namibie', flag: '🇳🇦' },
  LS: { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
  SZ: { code: '+268', name: 'Eswatini', flag: '🇸🇿' },
  MG: { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
  MU: { code: '+230', name: 'Maurice', flag: '🇲🇺' },
  SC: { code: '+248', name: 'Seychelles', flag: '🇸🇨' },
  KM: { code: '+269', name: 'Comores', flag: '🇰🇲' },
  ZA: { code: '+27', name: 'Afrique du Sud', flag: '🇿🇦' },
  AO: { code: '+244', name: 'Angola', flag: '🇦🇴' },
  CV: { code: '+238', name: 'Cap-Vert', flag: '🇨🇻' }
};

// Nettoyer un numéro de téléphone (supprimer espaces, tirets, etc.)
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-\(\)\.]/g, '');
};

// Extraire le code pays d'un numéro
export const extractCountryCode = (phone: string): string | null => {
  const cleaned = cleanPhoneNumber(phone);
  
  // Chercher le code pays dans notre liste
  for (const [country, data] of Object.entries(COUNTRY_CODES)) {
    if (cleaned.startsWith(data.code.replace('+', ''))) {
      return country;
    }
  }
  
  return null;
};

// Formater un numéro pour l'affichage
export const formatPhoneForDisplay = (phone: string, countryCode: string = 'FR'): string => {
  const cleaned = cleanPhoneNumber(phone);
  const country = COUNTRY_CODES[countryCode as keyof typeof COUNTRY_CODES];
  
  if (!country) return phone;
  
  // Supprimer le code pays du début
  let nationalNumber = cleaned;
  if (cleaned.startsWith(country.code.replace('+', ''))) {
    nationalNumber = cleaned.substring(country.code.replace('+', '').length);
  }
  
  // Formater selon le pays
  switch (countryCode) {
    case 'FR':
      // Format français: +33 6 12 34 56 78
      return `${country.code} ${nationalNumber.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`;
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
      // Format africain: +225 07 12 34 56 78
      return `${country.code} ${nationalNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`;
    default:
      // Format générique
      return `${country.code} ${nationalNumber}`;
  }
};

// Formater un numéro pour le stockage en base de données
export const formatPhoneForStorage = (phone: string, countryCode: string = 'FR'): string => {
  const cleaned = cleanPhoneNumber(phone);
  const country = COUNTRY_CODES[countryCode as keyof typeof COUNTRY_CODES];
  
  if (!country) return cleaned;
  
  // S'assurer que le code pays est présent
  if (!cleaned.startsWith(country.code.replace('+', ''))) {
    return country.code.replace('+', '') + cleaned;
  }
  
  return cleaned;
};

// Parser un numéro de téléphone complet
export const parsePhoneNumber = (phone: string, defaultCountry: string = 'FR'): PhoneNumber => {
  const cleaned = cleanPhoneNumber(phone);
  const detectedCountry = extractCountryCode(cleaned) || defaultCountry;
  const country = COUNTRY_CODES[detectedCountry as keyof typeof COUNTRY_CODES];
  

  
  if (!country) {
    return {
      countryCode: defaultCountry,
      nationalNumber: cleaned,
      formattedDisplay: cleaned,
      formattedStorage: cleaned,
      isValid: false
    };
  }
  
  // Extraire le numéro national
  let nationalNumber = cleaned;
  if (cleaned.startsWith(country.code.replace('+', ''))) {
    nationalNumber = cleaned.substring(country.code.replace('+', '').length);
  }
  
  const formattedDisplay = formatPhoneForDisplay(cleaned, detectedCountry);
  const formattedStorage = formatPhoneForStorage(cleaned, detectedCountry);
  
  // Validation basique (au moins 8 chiffres pour le numéro national)
  const isValid = nationalNumber.length >= 8 && nationalNumber.length <= 15;
  
  const result = {
    countryCode: detectedCountry,
    nationalNumber,
    formattedDisplay,
    formattedStorage,
    isValid
  };
  

  
  return result;
};

// Valider un numéro de téléphone
export const validatePhoneNumber = (phone: string, countryCode: string = 'FR'): boolean => {
  const parsed = parsePhoneNumber(phone, countryCode);
  return parsed.isValid;
};

// Obtenir la liste des pays pour un select
export const getCountryOptions = () => {
  return Object.entries(COUNTRY_CODES).map(([code, data]) => ({
    value: code,
    label: `${data.flag} ${data.name} (${data.code})`
  }));
};
