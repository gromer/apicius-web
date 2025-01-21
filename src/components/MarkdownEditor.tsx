import React from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function MarkdownEditor({ value, onChange, onCancel, onSave }: MarkdownEditorProps) {
  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[500px] rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100 font-mono text-sm p-4"
        placeholder="# Recipe Title

**Yield**: 4 servings

A brief description of the recipe...

## Ingredients
- 1 cup ingredient
- 2 tsp another ingredient

## Instructions
1. First step
2. Second step"
      />
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}