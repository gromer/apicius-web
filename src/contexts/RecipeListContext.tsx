import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiClient } from '../services/api';
import { Recipe } from '../types/api';

interface RecipeListContextType {
  refreshRecipeList: () => Promise<void>;
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
}

const RecipeListContext = createContext<RecipeListContextType | undefined>(undefined);

export function RecipeListProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRecipeList = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.getRecipes();
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const sortedRecipes = response.recipes?.sort(
        (a, b) => (a.updatedAt ?? a.createdAt) > (b.updatedAt ?? b.createdAt) ? -1 : 1
      ) ?? [];

      setRecipes(sortedRecipes);
    } catch (err) {
      console.error('Failed to load recipes:', err);
      setError('Failed to load recipes');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <RecipeListContext.Provider value={{ refreshRecipeList, recipes, isLoading, error }}>
      {children}
    </RecipeListContext.Provider>
  );
}

export function useRecipeList() {
  const context = useContext(RecipeListContext);
  if (context === undefined) {
    throw new Error('useRecipeList must be used within a RecipeListProvider');
  }
  console.log('context', context);
  console.log('recipes', context.recipes);
  return context;
} 