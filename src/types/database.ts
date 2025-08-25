import { User } from '@supabase/supabase-js';

export interface Garage {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface OrganizationData {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  garages: Garage[];
}

export interface ExtendedUser extends User {
  garageData: Garage | null;
}