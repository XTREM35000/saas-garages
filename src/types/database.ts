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