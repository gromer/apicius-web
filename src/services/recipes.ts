import { supabase } from './supabase';
import { apiClient } from '../services/api';

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
      await apiClient.updateRecipe(recipeId, {
        recipeMarkdown,
        updatedAt: new Date()
      })

      return;
    }

    const createRecipeResponse = await apiClient.createRecipe({
      isPublic: false,
      recipeMarkdown
    });

    if (createRecipeResponse.error) {
      throw new Error(`Failed to save recipe: ${createRecipeResponse.error.message}`);
    }

    return createRecipeResponse.createdRecipe;
  },

  async getUserRecipes(userId?: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await apiClient.getRecipes();
  },

  async deleteRecipe(recipeId: string) {
    await apiClient.deleteRecipe(recipeId);

    return { error: null };
  }
};