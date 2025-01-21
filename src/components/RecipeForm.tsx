import React from 'react';
import { Recipe, Ingredient, Instruction, Category, Tag } from '../types/recipe';
import { GripVertical, X, Plus } from 'lucide-react';

interface RecipeFormProps {
  recipe: Recipe;
  onChange: (recipe: Recipe) => void;
}

export function RecipeForm({ recipe, onChange }: RecipeFormProps) {
  const updateRecipe = (updates: Partial<Recipe>) => {
    onChange({ ...recipe, ...updates });
  };

  const moveItem = <T extends { id: string }>(
    array: T[],
    fromIndex: number,
    toIndex: number
  ): T[] => {
    const newArray = [...array];
    const [removed] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, removed);
    return newArray;
  };

  const handleIngredientChange = (index: number, updates: Partial<Ingredient>) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = { ...newIngredients[index], ...updates };
    updateRecipe({ ingredients: newIngredients });
  };

  const handleInstructionChange = (index: number, updates: Partial<Instruction>) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = { ...newInstructions[index], ...updates };
    updateRecipe({ instructions: newInstructions });
  };

  const handleCategoryChange = (index: number, updates: Partial<Category>) => {
    const newCategories = [...recipe.categories];
    newCategories[index] = { ...newCategories[index], ...updates };
    updateRecipe({ categories: newCategories });
  };

  const handleTagChange = (index: number, updates: Partial<Tag>) => {
    const newTags = [...recipe.tags];
    newTags[index] = { ...newTags[index], ...updates };
    updateRecipe({ tags: newTags });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={recipe.name}
            onChange={(e) => updateRecipe({ name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            value={recipe.imageUrl}
            onChange={(e) => updateRecipe({ imageUrl: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={recipe.description}
          onChange={(e) => updateRecipe({ description: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prep Time</label>
          <input
            type="text"
            value={recipe.prepTime || ''}
            onChange={(e) => updateRecipe({ prepTime: e.target.value || null })}
            placeholder="PT30M"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cook Time</label>
          <input
            type="text"
            value={recipe.cookTime || ''}
            onChange={(e) => updateRecipe({ cookTime: e.target.value || null })}
            placeholder="PT1H"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Servings</label>
          <input
            type="number"
            value={recipe.servings}
            onChange={(e) => updateRecipe({ servings: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Serving Unit</label>
          <input
            type="text"
            value={recipe.servingUnit}
            onChange={(e) => updateRecipe({ servingUnit: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
        <div className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={ingredient.id} className="flex items-center gap-2">
              <button
                type="button"
                className="cursor-move p-1 text-gray-400 hover:text-gray-600"
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                }}
                draggable
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={ingredient.quantity}
                onChange={(e) => handleIngredientChange(index, { quantity: parseFloat(e.target.value) })}
                className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(index, { unit: e.target.value })}
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="unit"
              />
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, { name: e.target.value })}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="ingredient"
              />
              <button
                type="button"
                onClick={() => {
                  const newIngredients = [...recipe.ingredients];
                  newIngredients.splice(index, 1);
                  updateRecipe({ ingredients: newIngredients });
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newIngredient: Ingredient = {
                id: crypto.randomUUID(),
                name: '',
                quantity: 0,
                unit: '',
              };
              updateRecipe({ ingredients: [...recipe.ingredients, newIngredient] });
            }}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Ingredient
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
        <div className="space-y-2">
          {recipe.instructions.map((instruction, index) => (
            <div key={instruction.id} className="flex items-start gap-2">
              <button
                type="button"
                className="cursor-move p-1 text-gray-400 hover:text-gray-600"
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                }}
                draggable
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <textarea
                  value={instruction.description}
                  onChange={(e) => handleInstructionChange(index, { description: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={2}
                />
                <input
                  type="text"
                  value={instruction.timeEstimate || ''}
                  onChange={(e) => handleInstructionChange(index, { timeEstimate: e.target.value || null })}
                  placeholder="Time estimate (e.g., PT15M)"
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const newInstructions = [...recipe.instructions];
                  newInstructions.splice(index, 1);
                  updateRecipe({ instructions: newInstructions.map((instr, i) => ({ ...instr, stepNumber: i + 1 })) });
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newInstruction: Instruction = {
                id: crypto.randomUUID(),
                description: '',
                stepNumber: recipe.instructions.length + 1,
                timeEstimate: null,
              };
              updateRecipe({ instructions: [...recipe.instructions, newInstruction] });
            }}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Instruction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div className="space-y-2">
            {recipe.categories.map((category, index) => (
              <div key={category.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => handleCategoryChange(index, { name: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newCategories = [...recipe.categories];
                    newCategories.splice(index, 1);
                    updateRecipe({ categories: newCategories });
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newCategory: Category = {
                  id: crypto.randomUUID(),
                  name: '',
                };
                updateRecipe({ categories: [...recipe.categories, newCategory] });
              }}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Category
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="space-y-2">
            {recipe.tags.map((tag, index) => (
              <div key={tag.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tag.name}
                  onChange={(e) => handleTagChange(index, { name: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTags = [...recipe.tags];
                    newTags.splice(index, 1);
                    updateRecipe({ tags: newTags });
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newTag: Tag = {
                  id: crypto.randomUUID(),
                  name: '',
                };
                updateRecipe({ tags: [...recipe.tags, newTag] });
              }}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}