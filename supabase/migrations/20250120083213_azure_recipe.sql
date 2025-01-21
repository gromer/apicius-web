/*
  # Add DELETE policy for recipes

  1. Changes
    - Add RLS policy to allow users to delete their own recipes
  2. Security
    - Policy ensures users can only delete their own recipes
    - Maintains data isolation between users
*/

CREATE POLICY "Users can delete their own recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);