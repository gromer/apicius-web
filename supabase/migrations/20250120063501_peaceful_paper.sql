/*
  # Create recipes table

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references auth.users)
      - `recipe_markdown` (text, stores the recipe content)
      - `created_at` (timestamptz, auto-generated)
      - `updated_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `recipes` table
    - Add policies for:
      - Insert: Authenticated users can insert their own recipes
      - Select: Authenticated users can read their own recipes
*/

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  recipe_markdown text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT NULL,

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);