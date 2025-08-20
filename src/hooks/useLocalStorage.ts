import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Récupérer depuis localStorage
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erreur lecture localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour définir la valeur
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à value d'être une fonction pour avoir la même API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Sauvegarder dans localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erreur écriture localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
