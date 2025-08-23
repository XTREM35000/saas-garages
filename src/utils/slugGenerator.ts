/**
 * Génère un slug automatique basé sur le nom de l'organisation
 * @param organizationName - Le nom de l'organisation
 * @returns Le slug généré
 */
export const generateSlug = (organizationName: string): string => {
  if (!organizationName || organizationName.length < 8) {
    return '';
  }

  // Nettoyer le nom (supprimer caractères spéciaux, accents, etc.)
  const cleanName = organizationName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .trim();

  // Diviser en mots
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);

  if (words.length === 0) {
    return '';
  }

  // Règles de génération
  if (words.length === 2) {
    // Si 2 mots : 3 premières lettres du premier + 3 dernières lettres du second
    const firstWord = words[0];
    const secondWord = words[1];
    
    const firstPart = firstWord.substring(0, Math.min(3, firstWord.length));
    const secondPart = secondWord.substring(Math.max(0, secondWord.length - 3));
    
    return `${firstPart}-${secondPart}`;
  } else if (words.length === 1) {
    // Si 1 mot : prendre les 6 premiers caractères
    return words[0].substring(0, Math.min(6, words[0].length));
  } else {
    // Si plusieurs mots : concaténer avec des tirets
    return words.join('-');
  }
};

/**
 * Vérifie si un slug est valide
 * @param slug - Le slug à vérifier
 * @returns true si le slug est valide
 */
export const isValidSlug = (slug: string): boolean => {
  if (!slug || slug.length < 3) {
    return false;
  }
  
  // Vérifier que le slug ne contient que des lettres, chiffres et tirets
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
};
