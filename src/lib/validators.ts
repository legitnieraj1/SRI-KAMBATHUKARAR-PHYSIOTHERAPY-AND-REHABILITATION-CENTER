import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string().min(10).max(15).regex(/^\d+$/, 'Phone must be digits only'),
  name: z.string().min(2).max(100),
});

export const sendOtpSchema = z.object({
  phone: z.string().min(10).max(15).regex(/^\d+$/, 'Phone must be digits only'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6),
  name: z.string().min(2).max(100).optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(1),
});

export const createBookingSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15).regex(/^\d+$/, 'Phone must be digits only'),
  doctor_id: z.string().uuid(),
  package_type: z.enum(['ONE_DAY', 'FIVE_DAY']),
  visit_type: z.enum(['CENTER', 'HOME']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  notes: z.string().optional(),
  address: z.string().optional(),
});

export const checkinSchema = z.object({
  attendance_status: z.enum(['PRESENT', 'ABSENT']),
  notes: z.string().optional(),
});

export const cashLogSchema = z.object({
  booking_id: z.string().uuid(),
  amount: z.number().positive(),
  patient_name: z.string().min(1),
  notes: z.string().optional(),
});

export const updateSessionStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

export const generateReportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM'),
});

export const createDoctorSchema = z.object({
  phone: z.string().min(10).max(15),
  name: z.string().min(2).max(100),
  password: z.string().min(6),
  specialization: z.string().default('Physiotherapy'),
  license_number: z.string().min(3),
  email: z.string().email().optional(),
});

export const updateDoctorSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).optional(),
  specialization: z.string().min(1).optional(),
  license_number: z.string().min(3).optional(),
  is_active: z.boolean().optional(),
});
