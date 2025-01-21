/*
  # Add OpenAI API usage tracking

  1. New Tables
    - `openai_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - References auth.users, nullable for anonymous users
      - `import_type` (text) - Either 'image' or 'text'
      - `model` (text) - The LLM model used
      - `prompt_tokens` (integer) - Number of tokens in the prompt
      - `completion_tokens` (integer) - Number of tokens in the completion
      - `total_tokens` (integer) - Total tokens used
      - `created_at` (timestamptz) - When the request was made

  2. Security
    - Enable RLS on `openai_usage` table
    - Add policy for authenticated users to read their own usage data
    - Add policy for service role to insert usage data
*/

CREATE TABLE IF NOT EXISTS openai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  import_type text NOT NULL CHECK (import_type IN ('image', 'text')),
  model text NOT NULL,
  prompt_tokens integer NOT NULL,
  completion_tokens integer NOT NULL,
  total_tokens integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE openai_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own usage data"
  ON openai_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_openai_usage_user_id ON openai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_openai_usage_created_at ON openai_usage(created_at);