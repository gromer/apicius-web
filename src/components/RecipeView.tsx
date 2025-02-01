import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clipboard, Trash2 } from 'lucide-react';
import { apiClient } from '../services/api';
import { recipesService } from '../services/recipes';
import ReactMarkdown from 'react-markdown';
import { useUser } from '../contexts/UserContext';
import { MarkdownEditor } from './MarkdownEditor';
import { useRecipeList } from '../contexts/RecipeListContext';

interface RecipeViewProps {
  recipeId: string;
}

export function RecipeView({ recipeId }: RecipeViewProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [recipe, setRecipe] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<string>('');
  const { refreshRecipeList } = useRecipeList();

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const recipe = await apiClient.getRecipe(recipeId);
      
      if (recipe.error) {
        throw new Error(recipe.error.message);
      }

      const recipeMarkdown = recipe.recipe?.recipeMarkdown;
      if (recipeMarkdown) {
        setRecipe(recipeMarkdown);
      } else {
        navigate('/import');
      }
    } catch (err) {
      setError('Failed to load recipe');
      console.error(err);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recipe);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Failed to copy recipe to clipboard');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await recipesService.deleteRecipe(recipeId);
      await refreshRecipeList();
      navigate('/import');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartEditing = () => {
    setEditedRecipe(recipe);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      await recipesService.saveRecipe({
        recipeMarkdown: editedRecipe,
        userId: user?.id,
        recipeId
      });
      setRecipe(editedRecipe);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRecipe('');
  };

  if (!recipe) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <div className="p-6">
        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div 
            className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6"
            onClick={!isEditing ? handleStartEditing : undefined}
            role={!isEditing ? "button" : undefined}
            tabIndex={!isEditing ? 0 : undefined}
          >
            {isEditing ? (
              <MarkdownEditor
                value={editedRecipe}
                onChange={setEditedRecipe}
                onCancel={handleCancelEdit}
                onSave={handleSaveEdit}
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400 hover:ring-opacity-50 rounded-lg transition-shadow duration-200">
                <ReactMarkdown>{recipe}</ReactMarkdown>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex space-x-4">
              <button
                onClick={handleCopyToClipboard}
                className={`flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${
                  copySuccess ? 'text-green-600 dark:text-green-400 border-green-500 dark:border-green-400' : ''
                }`}
              >
                <Clipboard className="h-5 w-5 mr-2" />
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}