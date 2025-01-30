import React, { useState } from 'react';
import { Upload, FileText, Loader2, Save, Clipboard, X } from 'lucide-react';
import { recipesService } from '../services/recipes';
import ReactMarkdown from 'react-markdown';
import { useUser } from '../contexts/UserContext';
import { MarkdownEditor } from './MarkdownEditor';
import { apiClient } from '../services/api';

export function RecipeImport() {
  const { user } = useUser();
  const [images, setImages] = useState<File[]>([]);
  const [recipe, setRecipe] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [importMethod, setImportMethod] = useState<'file' | 'text' | null>(null);
  const [recipeText, setRecipeText] = useState<string>('');
  const [showImport, setShowImport] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    const invalidFiles = files.filter(file => !validTypes.includes(file.type.toLowerCase()));
    if (invalidFiles.length > 0) {
      setError('Please upload only supported image files (PNG, JPG, GIF)');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError('All files must be less than 10MB');
      return;
    }

    setImages(prevImages => [...prevImages, ...files]);
    setError('');
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    if (currentImageIndex >= index) {
      setCurrentImageIndex(prev => Math.max(0, prev - 1));
    }
  };

  const processRecipe = async () => {
    if (!importMethod) {
      setError('Please select an import method');
      return;
    }

    if (importMethod === 'file' && images.length === 0) {
      setError('Please select at least one image');
      return;
    }

    if (importMethod === 'text' && !recipeText.trim()) {
      setError('Please enter recipe text');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setRecipe('');
      setShowImport(false);
      setIsStreaming(true);

      if (importMethod === 'file') {
        // Convert all images to base64 in parallel
        // const base64Images = await Promise.all(
        //   images.map(
        //     (image) =>
        //       new Promise<string>((resolve, reject) => {
        //         const reader = new FileReader();
        //         reader.onload = () => {
        //           const base64 = reader.result?.toString().split(',')[1];
        //           if (base64) {
        //             resolve(base64);
        //           } else {
        //             reject(new Error('Failed to convert image to base64'));
        //           }
        //         };
        //         reader.onerror = reject;
        //         reader.readAsDataURL(image);
        //       })
        //   )
        // );

        const importRecipeResponse = await apiClient.importRecipeFromImage(images)
        setRecipe(importRecipeResponse.recipeMarkdown);
        // let fullRecipe = '';
        // for await (const chunk of openAIService.extractRecipeFromImage(base64Images, true, user?.id)) {
        //   fullRecipe += chunk;
        //   setRecipe(fullRecipe);
        // }
        setIsStreaming(false);
      } else {
        const importRecipeResponse = await apiClient.importRecipeFromText(recipeText)
        setRecipe(importRecipeResponse.recipeMarkdown);
        // let fullRecipe = '';
        // for await (const chunk of openAIService.extractRecipeFromText(recipeText, 'text', true, user?.id)) {
        //   fullRecipe += chunk;
        //   setRecipe(fullRecipe);
        // }
        setIsStreaming(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process recipe');
      setShowImport(true);
    } finally {
      setLoading(false);
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

  const handleSave = async () => {
    if (!recipe) return;
    
    try {
      setIsSaving(true);
      await recipesService.saveRecipe({
        recipeMarkdown: recipe,
        userId: user?.id
      });
      setShowImport(true);
      setIsEditing(false);
      setRecipe('');
      setImages([]);
      setRecipeText('');
      setImportMethod(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditing = () => {
    setEditedRecipe(recipe);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setRecipe(editedRecipe);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRecipe('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <div className="p-6">
        <div className="space-y-6">
          {showImport && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Import from
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setImportMethod('file')}
                    className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${
                      importMethod === 'file'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    File
                  </button>
                  <button
                    onClick={() => setImportMethod('text')}
                    className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${
                      importMethod === 'text'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Text
                  </button>
                </div>
              </div>

              {importMethod === 'file' && (
                <div>
                  <label 
                    htmlFor="recipe-photo" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Recipe Screenshots
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:focus-within:ring-offset-gray-900"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleImageUpload}
                            multiple
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  </div>
                  {images.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-wrap gap-4">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className={`relative group rounded-lg overflow-hidden border-2 ${
                              index === currentImageIndex
                                ? 'border-indigo-500 dark:border-indigo-400'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Recipe screenshot ${index + 1}`}
                              className="h-24 w-24 object-cover"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                              {index + 1} of {images.length}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {images.length} {images.length === 1 ? 'image' : 'images'} selected
                      </p>
                    </div>
                  )}
                </div>
              )}

              {importMethod === 'text' && (
                <div>
                  <label
                    htmlFor="recipe-text"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Recipe Text
                  </label>
                  <textarea
                    id="recipe-text"
                    name="recipe-text"
                    rows={6}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Paste your recipe text here..."
                    value={recipeText}
                    onChange={(e) => setRecipeText(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {showImport && importMethod && (
            <button
              onClick={processRecipe}
              disabled={loading || (importMethod === 'file' && images.length === 0) || (importMethod === 'text' && !recipeText.trim())}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Processing...
                </>
              ) : (
                'Extract Recipe'
              )}
            </button>
          )}

          {recipe && (
            <div className="mt-6">
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
            </div>
          )}

          {recipe && !isStreaming && !isEditing && (
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
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}