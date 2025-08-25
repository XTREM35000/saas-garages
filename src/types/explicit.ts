// Types explicites pour éviter les inférences TypeScript infinies

export type SimpleUser = {
  id: string;
  email: string;
  created_at?: string;
  phone?: string;
  role?: string;
};

export type SimpleOrganization = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

export type SimpleProfile = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
};

export type SimpleUserOrganization = {
  id: string;
  user_id: string;
  organisation_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  organisations: SimpleOrganization;
};

export type SimpleUserSettings = {
  id: string;
  user_id: string;
  theme: string;
  locale: string;
  currency: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
  notifications_email?: boolean;
  notifications_push?: boolean;
  notifications_sms?: boolean;
  language?: string;
  two_factor?: boolean;
  session_timeout?: number;
  photo_evidence_enabled?: boolean;
  min_photos?: number;
  max_file_size?: number;
};

export type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

export type DatabaseResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
};