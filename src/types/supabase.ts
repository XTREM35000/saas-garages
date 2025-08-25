import { SupabaseClient } from '@supabase/supabase-js';

// Define Organization type (replace fields with actual structure as needed)
export type Organization = {
  id: string;
  name: string;
  created_at: string;
  // add other fields as necessary
};

// Define Garage type (replace fields with actual structure as needed)
export type Garage = {
  id: string;
  name: string;
  created_at: string;
  // add other fields as necessary
};

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at'>;
        Update: Partial<Organization>;
      };
      garages: {
        Row: Garage;
        Insert: Omit<Garage, 'id' | 'created_at'>;
        Update: Partial<Garage>;
      };
    };
  };
};

export type TypedSupabaseClient = SupabaseClient<Database>;

export type PostgrestSingleResponse<T> = {
  data: T | null;
  error: Error | null;
};