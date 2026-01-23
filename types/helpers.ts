// Type helpers and utilities for Supabase queries

import { Database } from './database'

// Supabase row types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table types
export type User = Tables<'users'>
export type DeveloperProfile = Tables<'developer_profiles'>
export type Project = Tables<'projects'>
export type ProjectFile = Tables<'project_files'>
export type Appointment = Tables<'appointments'>
export type Payment = Tables<'payments'>
export type Notification = Tables<'notifications'>
export type Message = Tables<'messages'>
export type ScreenSession = Tables<'screen_sessions'>
export type ProjectReview = Tables<'project_reviews'>
export type ActivityLog = Tables<'activity_logs'>

// Extended types with relations
export type ProjectWithClient = Project & {
  client?: Pick<User, 'full_name' | 'email'> | null
}

export type ProjectWithDeveloper = Project & {
  developer?: Pick<User, 'full_name' | 'email'> | null
}

export type MessageWithSender = Message & {
  sender?: Pick<User, 'full_name' | 'avatar_url'> | null
}

export type PaymentWithRelations = Payment & {
  project?: Project | null
  client?: User | null
  developer?: User | null
}
