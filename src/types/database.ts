import { User } from '@supabase/supabase-js';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  garages: Garage[];
}

export interface Garage {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export type OrganizationWithGarages = Organization & {
  garages: Garage[];
};

export interface ExtendedUser extends User {
  garageData: Garage | null;
}

export interface DatabaseGarage {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface DatabaseOrganization {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;  // Notez: on utilise owner_id au lieu de user_id
  garages: DatabaseGarage[];
}

export type DatabaseProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};