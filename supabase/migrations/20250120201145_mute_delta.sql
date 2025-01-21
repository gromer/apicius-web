/*
  # Add OpenAI usage insert policy

  1. Changes
    - Add policy to allow inserting OpenAI usage data for both authenticated and anonymous users
    - Anonymous users can only insert records with null user_id
    - Authenticated users can only insert records with their own user_id

  2. Security
    - Enable RLS for openai_usage table
    - Add policy for inserting usage data
*/

-- Policy for authenticated users
CREATE POLICY "Users can insert their own usage data"
  ON openai_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy for anonymous users
CREATE POLICY "Anonymous users can insert usage data"
  ON openai_usage
  FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
  );