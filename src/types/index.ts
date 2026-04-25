export type UserRole = 'PATIENT' | 'DOCTOR' | 'SUPER_ADMIN';
export type PackageType = 'ONE_DAY' | 'FIVE_DAY';
export type VisitType = 'CENTER' | 'HOME';
export type SessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT';
export type PaymentMethod = 'PREPAID' | 'CASH';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type ReportStatus = 'GENERATED' | 'LOCKED' | 'SETTLED';

export interface User {
  id: string;
  auth_id?: string;
  phone: string;
  name: string;
  role: UserRole;
  email?: string;
  profile_image?: string;
  language_preference: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  license_number: string;
  joined_date: string;
  availability_start: string;
  availability_end: string;
  commission_percent: number;
  is_active: boolean;
  user?: User;
}

export interface Patient {
  id: string;
  user_id: string;
  registration_date: string;
  user?: User;
}

export interface Booking {
  id: string;
  patient_id: string;
  doctor_id: string;
  package_type: PackageType;
  visit_type: VisitType;
  amount: number;
  start_date: string;
  notes?: string;
  created_at: string;
  patient?: User;
  doctor?: Doctor;
  sessions?: Session[];
  payment?: Payment;
}

export interface Session {
  id: string;
  booking_id: string;
  doctor_id: string;
  patient_id: string;
  scheduled_date: string;
  scheduled_time: string;
  actual_checkin_time?: string;
  session_status: SessionStatus;
  notes?: string;
  session_number: number;
  created_at: string;
  booking?: Booking;
  doctor?: Doctor;
  patient?: User;
  attendance?: Attendance;
  photos?: Photo[];
}

export interface Attendance {
  id: string;
  session_id: string;
  doctor_id: string;
  patient_id: string;
  status: AttendanceStatus;
  marked_at: string;
}

export interface Photo {
  id: string;
  session_id: string;
  doctor_id: string;
  file_url: string;
  file_size?: number;
  photo_timestamp: string;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  processed_at?: string;
  created_at: string;
}

export interface MonthlyReport {
  id: string;
  month: string;
  total_sessions: number;
  total_revenue: number;
  super_admin_share: number;
  status: ReportStatus;
  generated_at: string;
  locked_at?: string;
  generated_by?: string;
  doctor_earnings?: DoctorEarning[];
}

export interface DoctorEarning {
  id: string;
  doctor_id: string;
  report_id: string;
  sessions_count: number;
  total_revenue: number;
  commission: number;
  doctor?: Doctor;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AuthPayload {
  userId: string;
  phone: string;
  role: UserRole;
  name?: string;
}
