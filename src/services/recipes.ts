import { supabase } from './supabase';

export interface SaveRecipeParams {
  recipeMarkdown: string;
  userId?: string;
  recipeId?: string;
}

export const recipesService = {
  async saveRecipe({ recipeMarkdown, userId, recipeId }: SaveRecipeParams) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (recipeId) {
      const { data, error } = await supabase
        .from('recipes')
        .update({
          recipe_markdown: recipeMarkdown,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update recipe: ${error.message}`);
      }

      return data;
    }

    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          user_id: userId,
          recipe_markdown: recipeMarkdown,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save recipe: ${error.message}`);
    }

    return data;
  },

  async getUserRecipes(userId?: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await supabase
      .from('recipes')
      .select('id, recipe_markdown, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async deleteRecipe(recipeId: string) {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }

    return { error: null };
  }
};