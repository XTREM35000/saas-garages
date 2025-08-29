Parfait 🙌 On nettoie et on documente proprement.
Voici la **doc claire et lisible en Markdown**, pour ton projet, qui explique **les triggers existants** et **leurs interactions** :

---

# 📑 Documentation des triggers et fonctions (Supabase / Postgres)

## 1. `auth.users`

### 🔹 Trigger : `trg_handle_new_user`

* **Schéma** : `auth`
* **Table** : `users`
* **Événement** : `AFTER INSERT`
* **Action** : `EXECUTE FUNCTION handle_new_user()`

#### Fonction liée : `handle_new_user()`

* Crée automatiquement un **profil dans `public.profiles`** lorsqu’un nouvel utilisateur est enregistré dans `auth.users`.
* Initialise éventuellement certaines colonnes par défaut (`role`, `created_at`, etc.).
* ⚠️ Ce trigger peut être une source de **doublons** si la fonction `handle_new_user` ne vérifie pas correctement si le `profile` existe déjà.

---

## 2. `public.super_admins`

### 🔹 Trigger : `sync_super_admin_status_trigger`

* **Schéma** : `public`
* **Table** : `super_admins`
* **Événement** : `AFTER INSERT`
* **Action** : `EXECUTE FUNCTION sync_super_admin_status()`

#### Fonction liée : `sync_super_admin_status()`

* Met à jour le **profil (`public.profiles`)** correspondant pour indiquer que ce user est un **super admin**.
* Sert de **synchronisation** entre la table pivot `super_admins` et les infos du profil.

---

### 🔹 Trigger : `trg_prevent_multiple_superadmins`

* **Schéma** : `public`
* **Table** : `super_admins`
* **Événement** : `BEFORE INSERT`, `BEFORE UPDATE`
* **Action** : `EXECUTE FUNCTION prevent_multiple_superadmins()`

#### Fonction liée : `prevent_multiple_superadmins()`

* Vérifie avant insertion/mise à jour qu’il **n’existe pas déjà un autre super admin**.
* Garantit la **contrainte métier** : « un seul super admin global dans l’application ».
* Si un autre existe, l’opération est bloquée avec une erreur SQL.

---

## 3. Fonction utilitaire (nettoyée)

### 🔹 `is_super_admin(p_user_id uuid)`

```sql
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.super_admins sa
    WHERE sa.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

* Vérifie si un `user_id` donné est présent dans la table `super_admins`.
* Utile côté **Edge Functions** ou côté **frontend** pour conditionner l’accès.
* ✅ Version unique et propre (les doublons supprimés).

---

# 🔗 Interactions globales

```
auth.users (INSERT)
   └──> handle_new_user()
          └──> Crée un profil dans public.profiles

public.super_admins (INSERT)
   ├──> sync_super_admin_status()
   │       └──> Met à jour public.profiles (champ super_admin = true)
   └──> prevent_multiple_superadmins()
           └──> Bloque si déjà un super_admin existant
```

---

👉 Résumé :

* `handle_new_user` : crée les **profils**.
* `sync_super_admin_status` : synchronise le **statut super admin**.
* `prevent_multiple_superadmins` : empêche les doublons de super admins.
* `is_super_admin` : expose une **API SQL simple** pour vérifier.

---

⚡ Avec cette doc, tu peux maintenant décider :

* Ce qu’on **garde** (utile).
* Ce qu’on **drop** (doublons, triggers inutiles).
* Ce qu’on **renforce** (contrôles dans `handle_new_user` pour éviter les doublons de profils).

---

👉 Veux-tu que je prépare aussi une **requête SQL unique** pour scanner automatiquement si tu as encore des **doublons dans `profiles` ou `super_admins`** (et les nettoyer) ?
