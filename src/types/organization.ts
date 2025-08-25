export interface Garage {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

export interface OrganizationWithGarages extends Organization {
  garages: Garage[];
}

export type OrganizationResponse = {
  data: OrganizationWithGarages | null;
  error: any;
};