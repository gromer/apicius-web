import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '../contexts/UserContext';
import { useRecipeList } from '../contexts/RecipeListContext';
import { Recipe } from '../types/api';

interface RecipeListProps {
  selectedRecipeId: string | null;
  onRecipeSelect: (id: string) => void;
}

function getRecipeUpdatedOrCreatedAtText(recipe: Recipe) {
  const useUpdatedDate = recipe.updatedAt !== null && recipe.updatedAt > recipe.createdAt;
  const verb = useUpdatedDate ? 'Updated' : 'Created';
  const changeDate = useUpdatedDate ? new Date(recipe.updatedAt!) : new Date(recipe.createdAt);
  return `${verb} ${formatDistanceToNow(changeDate, { addSuffix: true })}`;
}

export function RecipeList({ selectedRecipeId, onRecipeSelect }: RecipeListProps) {
  const { user } = useUser();
  const { recipes, isLoading, error, refreshRecipeList } = useRecipeList();

  React.useEffect(() => {
    if (user) {
      refreshRecipeList();
    }
  }, [user?.id, refreshRecipeList]);

  const getRecipeName = (recipe: Recipe) => {
    const firstLine = recipe.recipeMarkdown.split('\n')[0];
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
                <div className="font-medium">{getRecipeName(recipe)}</div>
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