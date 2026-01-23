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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'client' | 'developer' | 'admin'
          avatar_url: string | null
          phone: string | null
          google_id: string | null
          is_active: boolean
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: 'client' | 'developer' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          google_id?: string | null
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'client' | 'developer' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          google_id?: string | null
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          developer_id: string | null
          title: string
          description: string | null
          requirements: string | null
          status: 'pending_review' | 'approved' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'
          estimated_cost: number | null
          final_cost: number | null
          estimated_duration: number | null
          include_hosting: boolean
          hosting_url: string | null
          repository_url: string | null
          created_at: string
          updated_at: string
          started_at: string | null
          completed_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          developer_id?: string | null
          title: string
          description?: string | null
          requirements?: string | null
          status?: 'pending_review' | 'approved' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'
          estimated_cost?: number | null
          final_cost?: number | null
          estimated_duration?: number | null
          include_hosting?: boolean
          hosting_url?: string | null
          repository_url?: string | null
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          developer_id?: string | null
          title?: string
          description?: string | null
          requirements?: string | null
          status?: 'pending_review' | 'approved' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'
          estimated_cost?: number | null
          final_cost?: number | null
          estimated_duration?: number | null
          include_hosting?: boolean
          hosting_url?: string | null
          repository_url?: string | null
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
          delivered_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'client' | 'developer' | 'admin'
      project_status: 'pending_review' | 'approved' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'
      payment_status: 'pending' | 'escrowed' | 'released' | 'refunded'
      appointment_status: 'scheduled' | 'completed' | 'cancelled'
      notification_type: 'info' | 'success' | 'warning' | 'error'
    }
  }
}
