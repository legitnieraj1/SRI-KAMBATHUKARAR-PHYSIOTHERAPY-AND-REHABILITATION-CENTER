-- SKCT Physio — Feature additions
-- Run in Supabase SQL Editor

-- 1. patient_ref_seq + ref_number on users
CREATE SEQUENCE IF NOT EXISTS patient_ref_seq START WITH 1;

ALTER TABLE users ADD COLUMN IF NOT EXISTS ref_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_ref_number ON users(ref_number) WHERE ref_number IS NOT NULL;

UPDATE users
  SET ref_number = 'PT' || LPAD(nextval('patient_ref_seq')::TEXT, 6, '0')
  WHERE role = 'PATIENT' AND ref_number IS NULL;

CREATE OR REPLACE FUNCTION auto_assign_ref_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'PATIENT' AND (NEW.ref_number IS NULL OR NEW.ref_number = '') THEN
    NEW.ref_number := 'PT' || LPAD(nextval('patient_ref_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_ref_number ON users;
CREATE TRIGGER trg_assign_ref_number
BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION auto_assign_ref_number();

-- 2. Payment tracking on sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMPTZ;

-- 3. Settings table (key-value store for GPay QR, etc.)
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES ('gpay_qr_url', '')
ON CONFLICT (key) DO NOTHING;
