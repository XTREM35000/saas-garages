import { User } from '@supabase/supabase-js';

export interface GarageData {
  name: string;
  ownerName: string;
  themeColor: string;
  // ...autres propriétés du garage
}

export interface Organization {
  id: string;
  name: string;
  created_at?: string;
  garages?: GarageData[];
}

export interface ExtendedUser extends User {
  garageData: GarageData;
}

export interface DashboardProps {
  user: ExtendedUser;
  organization: Organization;
}