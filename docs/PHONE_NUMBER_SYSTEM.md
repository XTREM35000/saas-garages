# Système de Gestion des Numéros de Téléphone

## Vue d'ensemble

Le système de gestion des numéros de téléphone a été conçu pour résoudre les problèmes de formatage et de stockage des numéros de téléphone dans les tables de base de données. Il sépare l'affichage du stockage et ajoute une gestion des codes pays.

## Architecture

### 1. Structure de Base de Données

Chaque table contenant des numéros de téléphone dispose maintenant de 3 colonnes supplémentaires :

```sql
-- Colonnes ajoutées à chaque table
phone_country_code VARCHAR(2) DEFAULT 'FR'  -- Code pays ISO 3166-1 alpha-2
phone_formatted VARCHAR(20)                 -- Numéro formaté pour le stockage (sans espaces)
phone_display VARCHAR(25)                   -- Numéro formaté pour l'affichage (avec espaces)
```

### 2. Utilitaires TypeScript

#### `src/utils/phoneUtils.ts`

Contient toutes les fonctions utilitaires pour :
- Parser et valider les numéros de téléphone
- Formater les numéros pour l'affichage et le stockage
- Gérer les codes pays
- Détecter automatiquement le pays d'un numéro

#### `src/hooks/usePhoneNumber.ts`

Hook React personnalisé pour :
- Gérer l'état d'un numéro de téléphone
- Valider en temps réel
- Formater automatiquement
- Gérer les changements de pays

### 3. Composant UI

#### `src/components/ui/phone-field-pro.tsx`

Composant React réutilisable avec :
- Sélecteur de pays avec drapeaux
- Validation en temps réel
- Formatage automatique
- Gestion des erreurs
- Support de plusieurs pays africains

## Utilisation

### 1. Dans un Composant React

```tsx
import { PhoneFieldPro } from '@/components/ui/phone-field-pro';
import { usePhoneNumber } from '@/hooks/usePhoneNumber';

const MyComponent = () => {
  const { phoneNumber, setPhoneNumber, isValid } = usePhoneNumber();
  
  return (
    <PhoneFieldPro
      value={phoneNumber.displayValue}
      onChange={(value) => setPhoneNumber(value)}
      onCountryChange={(country) => setPhoneNumber(phoneNumber.displayValue, country)}
      countryCode={phoneNumber.countryCode}
      required={true}
    />
  );
};
```

### 2. Sauvegarde en Base de Données

```tsx
import { preparePhoneForSave } from '@/utils/phoneMigration';

const handleSave = async (phone: string, countryCode: string) => {
  const phoneData = preparePhoneForSave(phone, countryCode);
  
  const { error } = await supabase
    .from('users')
    .update({
      phone: phoneData.phone_display,           // Pour l'affichage
      phone_country_code: phoneData.phone_country_code,
      phone_formatted: phoneData.phone_formatted, // Pour le stockage
      phone_display: phoneData.phone_display
    })
    .eq('id', userId);
};
```

### 3. Migration des Données Existantes

```tsx
import { migrateExistingPhoneNumbers } from '@/utils/phoneMigration';

// Migrer tous les numéros existants
await migrateExistingPhoneNumbers();
```

## Pays Supportés

Le système supporte actuellement les pays suivants :

### Europe
- 🇫🇷 France (+33)

### Afrique de l'Ouest
- 🇨🇮 Côte d'Ivoire (+225)
- 🇸🇳 Sénégal (+221)
- 🇲🇱 Mali (+223)
- 🇧🇫 Burkina Faso (+226)
- 🇳🇪 Niger (+227)
- 🇹🇬 Togo (+228)
- 🇧🇯 Bénin (+229)
- 🇨🇲 Cameroun (+237)
- 🇹🇩 Tchad (+235)
- 🇨🇫 République centrafricaine (+236)
- 🇬🇦 Gabon (+241)
- 🇨🇬 Congo (+242)
- 🇨🇩 République démocratique du Congo (+243)
- 🇬🇶 Guinée équatoriale (+240)
- 🇸🇹 Sao Tomé-et-Principe (+239)
- 🇬🇼 Guinée-Bissau (+245)
- 🇬🇳 Guinée (+224)
- 🇲🇷 Mauritanie (+222)
- 🇬🇲 Gambie (+220)
- 🇸🇱 Sierra Leone (+232)
- 🇱🇷 Libéria (+231)
- 🇬🇭 Ghana (+233)
- 🇳🇬 Nigeria (+234)

### Afrique du Nord
- 🇩🇿 Algérie (+213)
- 🇹🇳 Tunisie (+216)
- 🇱🇾 Libye (+218)
- 🇪🇬 Égypte (+20)
- 🇲🇦 Maroc (+212)
- 🇸🇩 Soudan (+249)
- 🇸🇸 Soudan du Sud (+211)
- 🇪🇹 Éthiopie (+251)
- 🇪🇷 Érythrée (+291)
- 🇩🇯 Djibouti (+253)
- 🇸🇴 Somalie (+252)

### Afrique de l'Est
- 🇰🇪 Kenya (+254)
- 🇹🇿 Tanzanie (+255)
- 🇺🇬 Ouganda (+256)
- 🇧🇮 Burundi (+257)
- 🇷🇼 Rwanda (+250)
- 🇲🇿 Mozambique (+258)
- 🇿🇲 Zambie (+260)
- 🇿🇼 Zimbabwe (+263)
- 🇧🇼 Botswana (+267)
- 🇳🇦 Namibie (+264)
- 🇱🇸 Lesotho (+266)
- 🇸🇿 Eswatini (+268)

### Afrique Australe et Océan Indien
- 🇲🇬 Madagascar (+261)
- 🇲🇺 Maurice (+230)
- 🇸🇨 Seychelles (+248)
- 🇰🇲 Comores (+269)
- 🇿🇦 Afrique du Sud (+27)
- 🇦🇴 Angola (+244)
- 🇨🇻 Cap-Vert (+238)

## Formats de Numéros

### France
- **Affichage** : `+33 6 12 34 56 78`
- **Stockage** : `33612345678`
- **Validation** : 10 chiffres après le code pays

### Côte d'Ivoire
- **Affichage** : `+225 07 12 34 56 78`
- **Stockage** : `2250712345678`
- **Validation** : 10 chiffres après le code pays

### Sénégal
- **Affichage** : `+221 77 12 34 56 78`
- **Stockage** : `2217712345678`
- **Validation** : 9 chiffres après le code pays

## Fonctions RPC PostgreSQL

### `update_super_admin_phone(admin_id, phone_country_code, phone_formatted, phone_display)`
Met à jour le numéro de téléphone d'un super_admin sans déclencher les triggers.

### `get_formatted_phone_number(table_name, record_id)`
Récupère un numéro de téléphone formaté depuis une table spécifique.

### `validate_phone_number(phone_number, country_code)`
Valide et formate un numéro de téléphone selon le pays.

### `migrate_all_phone_numbers()`
Migre tous les numéros de téléphone existants vers le nouveau format.

## Migration

### 1. Exécuter les Migrations SQL

```bash
# Migration 1 : Ajouter les colonnes
supabase db push

# Migration 2 : Ajouter les fonctions RPC
supabase db push
```

### 2. Migrer les Données Existantes

```tsx
// Via l'application
import { migrateExistingPhoneNumbers } from '@/utils/phoneMigration';
await migrateExistingPhoneNumbers();

// Ou via Supabase
const { data, error } = await supabase.rpc('migrate_all_phone_numbers');
```

## Validation

Le système valide les numéros selon les critères suivants :

1. **Longueur** : 8 à 15 chiffres pour le numéro national
2. **Format** : Respect du format du pays
3. **Code pays** : Code pays valide et reconnu
4. **Caractères** : Seuls les chiffres et le + sont autorisés

## Gestion des Erreurs

### Erreurs Courantes

1. **Format invalide** : Le numéro ne respecte pas le format du pays
2. **Longueur incorrecte** : Trop court ou trop long
3. **Code pays non supporté** : Pays non reconnu par le système
4. **Caractères invalides** : Présence de caractères non autorisés

### Messages d'Erreur

Les messages d'erreur sont localisés et spécifiques au pays :

- France : "Format de numéro français invalide"
- Côte d'Ivoire : "Format de numéro ivoirien invalide"
- Sénégal : "Format de numéro sénégalais invalide"

## Performance

### Index de Base de Données

```sql
CREATE INDEX idx_users_phone_country_code ON users(phone_country_code);
CREATE INDEX idx_super_admins_phone_country_code ON super_admins(phone_country_code);
```

### Optimisations

1. **Cache** : Les codes pays sont mis en cache côté client
2. **Validation** : Validation côté client avant envoi au serveur
3. **Formatage** : Formatage automatique sans requêtes supplémentaires

## Sécurité

### Contraintes de Validation

```sql
ALTER TABLE users 
ADD CONSTRAINT check_phone_country_code 
CHECK (phone_country_code IN ('FR', 'CI', 'SN', ...));
```

### Fonctions RPC Sécurisées

Toutes les fonctions RPC utilisent `SECURITY DEFINER` pour garantir les permissions appropriées.

## Tests

### Tests Unitaires

```tsx
import { parsePhoneNumber, validatePhoneNumber } from '@/utils/phoneUtils';

// Test de validation
const result = parsePhoneNumber('+33 6 12 34 56 78');
expect(result.isValid).toBe(true);
expect(result.countryCode).toBe('FR');
```

### Tests d'Intégration

```tsx
import { PhoneFieldPro } from '@/components/ui/phone-field-pro';

// Test du composant
render(<PhoneFieldPro value="" onChange={jest.fn()} />);
expect(screen.getByText('🇫🇷')).toBeInTheDocument();
```

## Maintenance

### Ajouter un Nouveau Pays

1. Ajouter le pays dans `COUNTRY_CODES` dans `phoneUtils.ts`
2. Ajouter le code pays dans les contraintes de validation SQL
3. Mettre à jour la documentation
4. Ajouter les tests correspondants

### Mise à Jour des Formats

1. Modifier les fonctions de formatage dans `phoneUtils.ts`
2. Mettre à jour les fonctions RPC PostgreSQL
3. Tester avec des numéros existants
4. Mettre à jour la documentation

## Support

Pour toute question ou problème lié au système de gestion des numéros de téléphone, consultez :

1. Cette documentation
2. Les tests unitaires
3. Les exemples d'utilisation dans le code
4. Les logs de migration dans la console
