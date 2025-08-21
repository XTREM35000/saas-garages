### Création du Super Admin (transactionnel)

Exemple d'appel HTTP vers l'Edge Function `setup-super-admin`:

```bash
curl -X POST "https://YOUR-PROJECT.supabase.co/functions/v1/setup-super-admin" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "StrongPassw0rd!",
    "phone": "+2250701020304",
    "nom": "Gogo",
    "prenom": "Thierry",
    "display_name": "Thierry Gogo",
    "avatar_url": "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/avatars/super_admin/xxx.png"
  }'
```

Réponse attendue:

```json
{ "success": true, "user": { "id": "<uuid>", "email": "owner@example.com" } }
```

Notes:
- Valide et garantit l'unicité email/phone
- Crée `auth.users` avec `phone` et `display_name` (metadata)
- Upsert `public.profiles` (`role` = `super_admin`)
- Insère `public.super_admins` avec plan `free` + période d'essai 7 jours

### Mise à jour du plan (Free → Mensuel/Annuel)

Exemple d'appel HTTP vers l'Edge Function `update-super-admin-plan`:

```bash
curl -X POST "https://YOUR-PROJECT.supabase.co/functions/v1/update-super-admin-plan" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<uuid-super-admin>",
    "plan": "mensuel"
  }'
```

Réponse attendue:

```json
{ "success": true, "plan": "mensuel" }
```

Règles d'essai:
- La période d'essai ne peut pas être relancée après expiration
- Le passage à `mensuel` ou `annuel` marque l'essai comme consommé

### Exemples de validations

Cas 1 – Email déjà utilisé:
```json
{ "success": false, "error": "Email déjà utilisé" }
```

Cas 2 – Téléphone au mauvais format:
```json
{ "success": false, "error": "Format de téléphone invalide" }
```

### Pseudo-tests unitaires (RPC)

```sql
-- 1) Création OK
select public.create_super_admin_complete(
  'test-owner@example.com', 'Passw0rd!', 'Owner Display', '+2250701020304'
);

-- 2) Doublon email
select public.create_super_admin_complete(
  'test-owner@example.com', 'Passw0rd!', 'Owner 2', '+2250701020305'
);

-- 3) Mise à jour plan
select public.update_super_admin_plan('<uuid-from-step-1>'::uuid, 'mensuel');

-- 4) Etat abonnement
select public.get_super_admin_subscription_state('<uuid-from-step-1>'::uuid);
```


