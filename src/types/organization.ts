export interface Garage {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
  garages?: Garage[];
}

export interface OrganizationResponse {
  data: Organization | null;
  error: Error | null;
}