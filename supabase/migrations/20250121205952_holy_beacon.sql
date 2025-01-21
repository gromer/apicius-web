/*
  # Create beta requests table

  1. New Tables
    - `beta_requests`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `status` (text, enum: requested, granted, denied)
      - `requested_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `beta_requests` table
    - Add policy for anonymous users to insert requests
    - Add policy for authenticated users to read all requests
*/

CREATE TABLE IF NOT EXISTS beta_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('requested', 'granted', 'denied')) DEFAULT 'requested',
  requested_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE beta_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can request beta access"
  ON beta_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all beta requests"
  ON beta_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_beta_requests_email ON beta_requests(email);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_beta_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_beta_requests_updated_at
  BEFORE UPDATE
  ON beta_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_requests_updated_at();