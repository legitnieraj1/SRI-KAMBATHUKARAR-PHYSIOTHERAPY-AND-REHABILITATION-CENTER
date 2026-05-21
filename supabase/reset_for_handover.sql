-- ============================================================
-- SKCT Physio — Full reset for client handover
-- Run in Supabase SQL Editor (physio project)
-- This deletes ALL test data. Super admins are preserved.
-- ============================================================

-- 1. Dependent tables first
DELETE FROM push_subscriptions;
DELETE FROM attendance;
DELETE FROM photos;
DELETE FROM payments;
DELETE FROM doctor_earnings;
DELETE FROM monthly_reports;
DELETE FROM sessions;
DELETE FROM bookings;

-- 2. Doctors (junction) + their user records
DELETE FROM doctors;
DELETE FROM users WHERE role = 'DOCTOR';

-- 3. Patients
DELETE FROM patients;
DELETE FROM users WHERE role = 'PATIENT';

-- 4. Legacy OTP records
DELETE FROM otps;

-- Super-admin users (Nieraj / Tharssith Vijay / VIJAYAKUMAR S) are untouched.
-- Verify:
SELECT id, name, phone, role FROM users ORDER BY role;
