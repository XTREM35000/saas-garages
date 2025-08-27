-- Créer les tables pour l'authentification et les profils
create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  subscription_type text default 'free',
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Créer la table des profils utilisateurs
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users on delete cascade not null,
  email text unique not null,
  full_name text,
  phone text,
  role text default 'user',
  avatar_url text,
  organisation_id uuid references organisations on delete set null,
  status boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Activer RLS
alter table public.organisations enable row level security;
alter table public.profiles enable row level security;

-- Politiques RLS pour organisations
create policy "Les utilisateurs peuvent voir leur organisation"
  on organisations for select
  using (
    auth.uid() in (
      select p.user_id 
      from profiles p 
      where p.organisation_id = organisations.id
    )
  );

-- Politiques RLS pour profiles
create policy "Les utilisateurs peuvent voir leur propre profil"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent mettre à jour leur propre profil"
  on profiles for update
  using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent insérer leur propre profil"
  on profiles for insert
  with check (auth.uid() = user_id);

-- Créer un bucket pour les avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Politiques pour le stockage des avatars
create policy "Les avatars sont publiquement accessibles"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Les utilisateurs peuvent uploader leur propre avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Les utilisateurs peuvent mettre à jour leur propre avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fonction pour créer automatiquement un profil lors de l'inscription
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

-- Trigger pour créer automatiquement un profil
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();