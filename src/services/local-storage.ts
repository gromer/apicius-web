import { v4 as uuidv4 } from 'uuid';

interface LocalRecipe {
  id: string;
  recipe_markdown: string;
  created_at: string;
}

export const localStorageService = {
  getRecipes(): LocalRecipe[] {
    try {
      const recipes = localStorage.getItem('recipes');
      return recipes ? JSON.parse(recipes) : [];
    } catch (error) {
      console.error('Failed to load recipes from local storage:', error);
      return [];
    }
  },

  saveRecipe(recipeMarkdown: string): LocalRecipe {
    try {
      const recipes = this.getRecipes();
      const newRecipe = {
        id: uuidv4(),
        recipe_markdown: recipeMarkdown,
        created_at: new Date().toISOString()
      };
      
      recipes.unshift(newRecipe);
      localStorage.setItem('recipes', JSON.stringify(recipes));
      
      return newRecipe;
    } catch (error) {
      throw new Error('Failed to save recipe to local storage');
    }
  },

  deleteRecipe(recipeId: string): void {
    try {
      const recipes = this.getRecipes();
      const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    } catch (error) {
      throw new Error('Failed to delete recipe from local storage');
    }
  }
};