// Database Types
export type UserRole = 'client' | 'developer' | 'admin';

export type ProjectStatus = 
  | 'pending_review' 
  | 'approved' 
  | 'in_progress' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'escrowed' | 'released' | 'refunded';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Deliverable Types
export interface ProjectDeliverable {
  id: string;
  project_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  description?: string;
  created_at: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  google_id?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeveloperProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Project Types
export interface Project {
  id: string;
  client_id: string;
  developer_id?: string;
  title: string;
  description?: string;
  requirements?: string;
  status: ProjectStatus;
  estimated_cost?: number;
  final_cost?: number;
  estimated_duration?: number;
  include_hosting: boolean;
  hosting_url?: string;
  repository_url?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  delivered_at?: string;
  client?: User;
  developer?: User;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  created_at: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  project_id: string;
  client_id: string;
  developer_id?: string;
  scheduled_at: string;
  duration: number;
  status: AppointmentStatus;
  meeting_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
  client?: User;
  developer?: User;
}

// Payment Types
export type PaymentType = 'full' | 'initial' | 'final';

export interface Payment {
  id: string;
  project_id: string;
  client_id: string;
  developer_id: string;
  amount: number;
  payment_type: PaymentType; // 'full' (100%), 'initial' (60%), or 'final' (40%)
  status: PaymentStatus;
  paystack_reference?: string;
  paystack_transaction_id?: string;
  escrow_date?: string;
  release_date?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string;
  metadata?: any;
  created_at: string;
}

// Message Types
export interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  file_url?: string;
  attachments?: string[];
  created_at: string;
  sender?: User;
  receiver?: User;
}

// Screen Session Types
export interface ScreenSession {
  id: string;
  project_id: string;
  host_id: string;
  participant_id: string;
  daily_room_name: string;
  daily_room_url: string;
  started_at: string;
  ended_at?: string;
  duration?: number;
  recording_url?: string;
}

// Review Types
export interface ProjectReview {
  id: string;
  project_id: string;
  client_id: string;
  developer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface ProjectSubmissionForm {
  title: string;
  description: string;
  requirements: string;
  include_hosting: boolean;
  files?: File[];
}

export interface AppointmentForm {
  scheduled_at: string;
  notes?: string;
}

export interface ProfileUpdateForm {
  full_name: string;
  phone?: string;
  avatar_url?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_revenue: number;
  pending_payments: number;
}
