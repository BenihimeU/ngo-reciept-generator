CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  pan varchar(10) NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  urn text NOT NULL DEFAULT '',
  urn_date date,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  signatory text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  next_receipt_number bigint NOT NULL DEFAULT 1 CHECK (next_receipt_number > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash char(64) PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id uuid NOT NULL REFERENCES organisations(id),
  created_by uuid NOT NULL REFERENCES admins(id),
  receipt_no text NOT NULL,
  donor_name text NOT NULL,
  donor_id_type text NOT NULL CHECK (donor_id_type IN ('PAN', 'Aadhaar', 'Other')),
  donor_id text NOT NULL,
  donor_address text NOT NULL,
  donor_email text NOT NULL DEFAULT '',
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  donation_date date NOT NULL,
  payment_mode text NOT NULL CHECK (payment_mode IN ('UPI', 'Bank transfer', 'Cheque', 'Demand draft', 'Cash', 'Card', 'Other')),
  reference text NOT NULL DEFAULT '',
  donation_type text NOT NULL CHECK (donation_type IN ('Others', 'Corpus', 'Specific grants')),
  purpose text NOT NULL DEFAULT '',
  organisation_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, receipt_no)
);
CREATE INDEX IF NOT EXISTS receipts_org_date_idx ON receipts (organisation_id, donation_date DESC, created_at DESC);
