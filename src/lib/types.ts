export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          organisation_id: string | null
          path: string
          reason: string | null
          success: boolean
          timestamp: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          organisation_id?: string | null
          path: string
          reason?: string | null
          success: boolean
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          organisation_id?: string | null
          path?: string
          reason?: string | null
          success?: boolean
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_approvals: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          organisation_id: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          status: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          status?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          pricing_plan: string
          super_admin_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          pricing_plan: string
          super_admin_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          pricing_plan?: string
          super_admin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_super_admin_id_fkey"
            columns: ["super_admin_id"]
            isOneToOne: false
            referencedRelation: "super_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          client_id: string | null
          created_at: string | null
          garage_id: string | null
          id: string
          notes: string | null
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          appointment_date: string
          client_id?: string | null
          created_at?: string | null
          garage_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          appointment_date?: string
          client_id?: string | null
          created_at?: string | null
          garage_id?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          garage_id: string | null
          id: string
          loyalty_points: number | null
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          garage_id?: string | null
          id?: string
          loyalty_points?: number | null
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          garage_id?: string | null
          id?: string
          loyalty_points?: number | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string
          full_name: string | null
          id: string
          last_name: string
          notes: string | null
          organisation_id: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          last_name: string
          notes?: string | null
          organisation_id?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          organisation_id?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          can_access_system: boolean | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          email: string
          emergency_contact: Json | null
          employee_id: string | null
          first_name: string
          full_name: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          last_name: string
          national_id: string | null
          notes: string | null
          organisation_id: string | null
          permissions: Json | null
          phone: string | null
          position: string
          salary_grade: string | null
          speciality: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          can_access_system?: boolean | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          emergency_contact?: Json | null
          employee_id?: string | null
          first_name: string
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          national_id?: string | null
          notes?: string | null
          organisation_id?: string | null
          permissions?: Json | null
          phone?: string | null
          position: string
          salary_grade?: string | null
          speciality?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          can_access_system?: boolean | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          emergency_contact?: Json | null
          employee_id?: string | null
          first_name?: string
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          national_id?: string | null
          notes?: string | null
          organisation_id?: string | null
          permissions?: Json | null
          phone?: string | null
          position?: string
          salary_grade?: string | null
          speciality?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      garages: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          opening_hours: string | null
          organisation_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          opening_hours?: string | null
          organisation_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          opening_hours?: string | null
          organisation_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          organisation_id: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          organisation_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          organisation_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          organisation_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_workflow_states: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_step: string
          id: string
          is_completed: boolean | null
          last_updated: string | null
          organisation_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_step: string
          id?: string
          is_completed?: boolean | null
          last_updated?: string | null
          organisation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_step?: string
          id?: string
          is_completed?: boolean | null
          last_updated?: string | null
          organisation_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organisation_creation_log: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          organisation_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          organisation_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          organisation_id?: string | null
        }
        Relationships: []
      }
      organisations: {
        Row: {
          created_at: string | null
          description: string | null
          email: string
          id: string
          name: string
          owner_id: string | null
          slug: string
          subscription_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          name: string
          owner_id?: string | null
          slug: string
          subscription_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          name?: string
          owner_id?: string | null
          slug?: string
          subscription_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string | null
          admin_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          admin_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          admin_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          id: string
          name: string | null
        }
        Insert: {
          id?: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          feature_name: string
          feature_value: Json | null
          id: string
          plan_type: string
        }
        Insert: {
          feature_name: string
          feature_value?: Json | null
          id?: string
          plan_type: string
        }
        Update: {
          feature_name?: string
          feature_value?: Json | null
          id?: string
          plan_type?: string
        }
        Relationships: []
      }
      plan_quotas: {
        Row: {
          id: string
          plan_type: string
          quota_name: string
          quota_value: number | null
        }
        Insert: {
          id?: string
          plan_type: string
          quota_name: string
          quota_value?: number | null
        }
        Update: {
          id?: string
          plan_type?: string
          quota_name?: string
          quota_value?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          description: string | null
          id: string
          name: string
          organisation_id: string | null
          price: number | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          organisation_id?: string | null
          price?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          organisation_id?: string | null
          price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          is_superadmin: boolean | null
          name: string | null
          organisation_id: string | null
          phone: string | null
          phone_verified: boolean | null
          role: string | null
          sms_code: string | null
          sms_code_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_superadmin?: boolean | null
          name?: string | null
          organisation_id?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          role?: string | null
          sms_code?: string | null
          sms_code_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_superadmin?: boolean | null
          name?: string | null
          organisation_id?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          role?: string | null
          sms_code?: string | null
          sms_code_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      repair_photos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          photo_url: string
          repair_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          photo_url: string
          repair_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          photo_url?: string
          repair_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_photos_repair_id_fkey"
            columns: ["repair_id"]
            isOneToOne: false
            referencedRelation: "repairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      repairs: {
        Row: {
          description: string
          end_date: string | null
          id: string
          organisation_id: string | null
          start_date: string | null
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          description: string
          end_date?: string | null
          id?: string
          organisation_id?: string | null
          start_date?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          description?: string
          end_date?: string | null
          id?: string
          organisation_id?: string | null
          start_date?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sms_validations: {
        Row: {
          code: string
          created_at: string | null
          id: string
          phone: string
          user_id: string | null
          validated: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          phone: string
          user_id?: string | null
          validated?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          phone?: string
          user_id?: string | null
          validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_validations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_items: {
        Row: {
          created_at: string | null
          garage_id: string | null
          id: string
          name: string
          quantity: number | null
          supplier: string | null
          threshold: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          garage_id?: string | null
          id?: string
          name: string
          quantity?: number | null
          supplier?: string | null
          threshold?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          garage_id?: string | null
          id?: string
          name?: string
          quantity?: number | null
          supplier?: string | null
          threshold?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_items_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          id: string
          movement_type: string
          organisation_id: string | null
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          movement_type: string
          organisation_id?: string | null
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          movement_type?: string
          organisation_id?: string | null
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          end_date: string | null
          id: string
          organisation_id: string | null
          plan_type: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          end_date?: string | null
          id?: string
          organisation_id?: string | null
          plan_type: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          organisation_id?: string | null
          plan_type?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      super_admins: {
        Row: {
          created_at: string | null
          email: string
          est_actif: boolean
          id: string
          is_superadmin: boolean | null
          name: string | null
          nom: string | null
          phone: string | null
          prenom: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          est_actif?: boolean
          id?: string
          is_superadmin?: boolean | null
          name?: string | null
          nom?: string | null
          phone?: string | null
          prenom?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          est_actif?: boolean
          id?: string
          is_superadmin?: boolean | null
          name?: string | null
          nom?: string | null
          phone?: string | null
          prenom?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_contexts: {
        Row: {
          current_organisation_id: string | null
          id: string
          preferences: Json | null
          user_id: string | null
        }
        Insert: {
          current_organisation_id?: string | null
          id?: string
          preferences?: Json | null
          user_id?: string | null
        }
        Update: {
          current_organisation_id?: string | null
          id?: string
          preferences?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_organisations: {
        Row: {
          created_at: string | null
          id: string
          organisation_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organisation_id: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organisation_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          permissions: Json | null
          role_name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          permissions?: Json | null
          role_name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          permissions?: Json | null
          role_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          locale: string
          notifications_enabled: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          locale?: string
          notifications_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          locale?: string
          notifications_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          garage_id: string | null
          id: string
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          garage_id?: string | null
          id?: string
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          garage_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_garage_id_fkey"
            columns: ["garage_id"]
            isOneToOne: false
            referencedRelation: "garages"
            referencedColumns: ["id"]
          },
        ]
      }
      users_organisations: {
        Row: {
          created_at: string | null
          id: string
          organisation_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organisation_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organisation_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          license_plate: string | null
          make: string
          model: string
          organisation_id: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          license_plate?: string | null
          make: string
          model: string
          organisation_id?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          license_plate?: string | null
          make?: string
          model?: string
          organisation_id?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_states: {
        Row: {
          created_at: string | null
          current_step: string
          id: string
          is_completed: boolean | null
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_step: string
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_step?: string
          id?: string
          is_completed?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_first_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_admin_email_exists: {
        Args: { p_email: string }
        Returns: boolean
      }
      check_create_organisation_permissions: {
        Args: { p_owner_id: string }
        Returns: undefined
      }
      check_email_exists: {
        Args: { p_email: string }
        Returns: boolean
      }
      check_super_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_system_tables: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_role: {
        Args: { p_email: string }
        Returns: string
      }
      create_admin_user: {
        Args: {
          p_email: string
          p_nom: string
          p_password: string
          p_phone: string
        }
        Returns: string
      }
      create_admin_v3: {
        Args: {
          p_email: string
          p_first_name: string
          p_name: string
          p_password: string
          p_phone: string
        }
        Returns: string
      }
      create_admin_v4: {
        Args: {
          p_email: string
          p_is_superadmin?: boolean
          p_nom: string
          p_password: string
          p_phone: string
        }
        Returns: string
      }
      create_admin_with_auth: {
        Args:
          | {
              p_email: string
              p_first_name: string
              p_name: string
              p_password: string
              p_phone: string
            }
          | {
              p_email: string
              p_nom: string
              p_password: string
              p_phone: string
            }
        Returns: string
      }
      create_admin_with_auth_v2: {
        Args: {
          p_email: string
          p_first_name: string
          p_name: string
          p_password: string
          p_phone: string
        }
        Returns: string
      }
      create_auth_user: {
        Args: { email: string; password: string }
        Returns: string
      }
      create_initial_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_initial_user_profile: {
        Args: {
          p_user_email: string
          p_user_full_name: string
          p_user_id: string
        }
        Returns: undefined
      }
      create_organisation_with_admin_v2: {
        Args: {
          admin_id: string
          org_name: string
          org_slug: string
          org_subscription_plan: string
        }
        Returns: {
          organisation_id: string
          success: boolean
        }[]
      }
      create_organisation_with_owner: {
        Args:
          | {
              p_bypass_auth?: boolean
              p_code: string
              p_email: string
              p_name: string
              p_owner_id: string
              p_slug: string
              p_subscription_type?: string
            }
          | {
              p_code: string
              p_email: string
              p_name: string
              p_owner_id: string
              p_slug: string
              p_subscription_type?: string
            }
        Returns: Json
      }
      create_organisation_with_owner_v2: {
        Args: {
          p_code: string
          p_email: string
          p_name: string
          p_owner_id: string
          p_slug: string
          p_subscription_type?: string
        }
        Returns: string
      }
      create_organization: {
        Args: {
          org_code: string
          org_email: string
          org_name: string
          org_slug: string
          org_subscription_type: string
        }
        Returns: Json
      }
      create_organization_for_admin: {
        Args: {
          p_description?: string
          p_email: string
          p_name: string
          p_slug: string
          p_subscription_type?: string
        }
        Returns: string
      }
      create_organization_with_admin: {
        Args: {
          p_admin_id: string
          p_description?: string
          p_email: string
          p_name: string
          p_subscription_type?: string
        }
        Returns: string
      }
      create_organization_with_owner: {
        Args: {
          org_code: string
          org_email: string
          org_name: string
          org_slug: string
          org_subscription_type: string
          owner_user_id: string
        }
        Returns: Json
      }
      create_profile: {
        Args: {
          avatar_url: string
          first_name: string
          last_name: string
          phone: string
          theme: string
          user_id: string
        }
        Returns: string
      }
      create_profile_with_role: {
        Args: {
          p_email: string
          p_id: string
          p_name: string
          p_phone: string
          p_role: string
        }
        Returns: undefined
      }
      create_super_admin: {
        Args: { p_email: string; p_name: string; p_password: string }
        Returns: Json
      }
      create_super_admin_v2: {
        Args: { p_email: string; p_name: string; p_password: string }
        Returns: Json
      }
      create_super_admin_with_auth: {
        Args: {
          p_email: string
          p_nom: string
          p_password: string
          p_phone: string
        }
        Returns: string
      }
      create_user_profile: {
        Args:
          | {
              avatar_url?: string
              email: string
              full_name: string
              organisation_id?: string
              phone?: string
              role?: string
              user_id: string
            }
          | {
              full_name: string
              phone: string
              user_email: string
              user_id: string
              user_role: string
            }
          | {
              user_email: string
              user_name: string
              user_password: string
              user_phone: string
              user_role?: string
            }
        Returns: undefined
      }
      create_user_simple: {
        Args: { user_email: string; user_id: string; user_role?: string }
        Returns: Json
      }
      delete_profile: {
        Args: { profile_id: string }
        Returns: undefined
      }
      disable_rls_for_org_creation: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      disable_rls_for_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_rls_after_org_creation: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_rls_for_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_in_transaction: {
        Args: { queries: Json[] }
        Returns: Json
      }
      generate_org_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string
          theme: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_organisations: {
        Args: { user_uuid: string }
        Returns: {
          organisation_id: string
          role: string
        }[]
      }
      init_saas_schema: {
        Args: Record<PropertyKey, never> | { org_code: string }
        Returns: undefined
      }
      initialize_system: {
        Args: {
          admin_email: string
          admin_name: string
          admin_password: string
        }
        Returns: Json
      }
      is_first_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      quick_downgrade_to_admin: {
        Args: { target_email: string }
        Returns: undefined
      }
      send_validation_sms: {
        Args: { phone_number: string; user_id: string }
        Returns: boolean
      }
      set_user_role: {
        Args: { new_role: string; user_id: string }
        Returns: undefined
      }
      setup_garage: {
        Args: {
          garage_address: string
          garage_description: string
          garage_name: string
          garage_opening_hours: string
          garage_phone: string
        }
        Returns: boolean
      }
      update_profile: {
        Args: {
          avatar_url: string
          first_name: string
          last_name: string
          phone: string
          profile_id: string
          theme: string
        }
        Returns: undefined
      }
      update_profile_role: {
        Args: { new_role: string; profile_id: string }
        Returns: undefined
      }
      update_user_role: {
        Args: { p_email: string; p_role: string }
        Returns: undefined
      }
      update_workflow_state: {
        Args: { p_current_step: string; p_user_id: string }
        Returns: boolean
      }
      upsert_user_and_profile_v2: {
        Args: {
          p_avatar_url?: string
          p_email: string
          p_nom: string
          p_organisation_id?: string
          p_phone?: string
          p_prenom: string
          p_user_id: string
        }
        Returns: Json
      }
      upsert_user_profile: {
        Args: {
          avatar_url?: string
          full_name: string
          organization_id?: string
          phone?: string
          user_email: string
          user_id: string
          user_role?: string
        }
        Returns: Json
      }
      verify_or_create_admin_profile: {
        Args: { p_email: string; p_user_id?: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
