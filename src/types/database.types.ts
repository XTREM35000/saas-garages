export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      super_admins: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string | null
          role: string
          user_id: string
          is_superadmin: boolean | null
          phone: string | null
          est_actif: boolean
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string | null
          role?: string
          user_id: string
          is_superadmin?: boolean | null
          phone?: string | null
          est_actif?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string | null
          role?: string
          user_id?: string
          is_superadmin?: boolean | null
          phone?: string | null
          est_actif?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string | null
          phone: string | null
          role: string | null
          organisation_id: string | null
          is_active: boolean | null
          is_superadmin: boolean | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          phone?: string | null
          role?: string | null
          organisation_id?: string | null
          is_active?: boolean | null
          is_superadmin?: boolean | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          phone?: string | null
          role?: string | null
          organisation_id?: string | null
          is_active?: boolean | null
          is_superadmin?: boolean | null
        }
      }
      // Ajoutez d'autres tables selon vos besoins
    }
    Functions: {
      can_create_first_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      create_super_admin: {
        Args: {
          p_email: string
          p_name: string
          p_password: string
        }
        Returns: Json
      }
      create_profile: {
        Args: {
          user_id: string
          first_name: string
          last_name: string
          phone: string
          avatar_url: string
          theme: string
        }
        Returns: string
      }
    }
    Enums: {
      // Vos énumérations si vous en avez
    }
  }
}