import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '../contexts/UserContext';
import { apiClient } from '../services/api';
import { recipesService } from '../services/recipes';
import { Recipe } from '../types/api';

interface RecipeModel {
  created_at: string;
  id: string;
  recipe_markdown: string;
  updated_at?: string;
}

interface RecipeListProps {
  selectedRecipeId: string | null;
  onRecipeSelect: (id: string) => void;
}

function getRecipeUpdatedOrCreatedAtText(recipe: RecipeModel) {
  const useUpdatedDate = recipe.updated_at !== undefined;
  const verb = useUpdatedDate ? 'Updated' : 'Created';
  const changeDate = useUpdatedDate ? new Date(recipe.updated_at!) : new Date(recipe.created_at);
  return `${verb} ${formatDistanceToNow(changeDate, { addSuffix: true })}`;
}

export function RecipeList({ selectedRecipeId, onRecipeSelect }: RecipeListProps) {
  const { user } = useUser();
  const [recipes, setRecipes] = React.useState<RecipeModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadRecipes = async () => {
      // Only load recipes if user is authenticated
      if (user) {
        try {
          setIsLoading(true);
          setError(null);
          const getRecipesResponse = await apiClient.getRecipes();
          if (getRecipesResponse.error) {
            throw new Error(getRecipesResponse.error.message);
          }

          const recipes = getRecipesResponse
            .recipes
            ?.sort((a, b) => (a.updatedAt ?? a.createdAt) > (b.updatedAt ?? b.createdAt) ? -1 : 1)
            ?? [];

          console.log('Recipe count: ' + recipes.length);

          const mapper = (recipe: Recipe) => ({
            created_at: recipe.createdAt.toString(),
            id: recipe.id,
            recipe_markdown: recipe.recipeMarkdown,
            updated_at: recipe.updatedAt?.toString(),
          });

          setRecipes(recipes.map(mapper));
        } catch (err) {
          console.error('Failed to load recipes:', err);
          setError('Failed to load recipes');
          setRecipes([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear recipes if user is not authenticated
        setRecipes([]);
        setIsLoading(false);
        setError(null);
      }
    };

    loadRecipes();
  }, [user?.id]);

  const getRecipeName = (markdown: string) => {
    const firstLine = markdown.split('\n')[0];
    return firstLine.replace(/^#\s+/, '');
  };

  if (error) {
    return (
      <div className="py-4 px-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recipes yet</p>
      ) : (
        <ul className="space-y-1">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <button
                onClick={() => onRecipeSelect(recipe.id)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${selectedRecipeId === recipe.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-900 dark:text-gray-100'
                  }`}
              >
                <div className="font-medium">{getRecipeName(recipe.recipe_markdown)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getRecipeUpdatedOrCreatedAtText(recipe)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}