import React, { useState, useEffect } from 'react';
import { Save, Moon, Sun, Monitor, Upload, X } from 'lucide-react';
import { apiClient } from '../services/api';
import { settingsService } from '../services/settings';
import { supabase } from '../services/supabase';
import { storageService } from '../services/storage';
import { Avatar } from './Avatar';

interface UserSettingsProps {
  isDark: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export function UserSettings({ isDark, onThemeChange }: UserSettingsProps) {
  const [displayName, setDisplayName] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(isDark ? 'dark' : 'light');
  const [savedTheme, setSavedTheme] = useState<'light' | 'dark' | 'system'>(isDark ? 'dark' : 'light');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const response = await apiClient.getPreferences();
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const settings = response.preferences;
      if (settings) {
        setDisplayName(settings.displayName || '');
        setTheme(settings.theme);
        setSavedTheme(settings.theme);
        setCurrentAvatar(settings.avatarUrl);
      }
      
      // Update the theme immediately
      const isDarkMode = settings?.theme === 'dark' || 
        (settings?.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      onThemeChange(isDarkMode);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // Update the theme immediately
    const isDarkMode = newTheme === 'dark' || 
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    onThemeChange(isDarkMode);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      let avatarUrl = currentAvatar;
      if (avatarFile) {
        avatarUrl = await storageService.uploadAvatar(avatarFile, user?.id);
      }

      await settingsService.saveUserSettings({
        display_name: displayName,
        theme,
        avatar_url: avatarUrl
      }, user?.id);
      
      setSavedTheme(theme);
      setCurrentAvatar(avatarUrl);
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
      // Revert to saved theme if save fails
      handleThemeChange(savedTheme);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to saved theme if user navigates away without saving
  useEffect(() => {
    return () => {
      handleThemeChange(savedTheme);
    };
  }, [savedTheme]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-8">
            User Settings
          </h3>
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Avatar
              </label>
              <div className="flex items-start space-x-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar
                    url={avatarPreview || currentAvatar}
                    displayName={displayName}
                    size="lg"
                  />
                  {(avatarPreview || currentAvatar) && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="avatar-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:focus-within:ring-offset-gray-900"
                  >
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <span>Upload a file</span>
                          <input
                            id="avatar-upload"
                            name="avatar-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 2MB
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="display-name"
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 pl-4 pr-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:bg-gray-700 sm:text-sm sm:leading-6 transition-colors"
                  placeholder="Enter your display name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`relative flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors ${
                    theme === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-indigo-600 dark:ring-indigo-400'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`relative flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-indigo-600 dark:ring-indigo-400'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`relative flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors ${
                    theme === 'system'
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-indigo-600 dark:ring-indigo-400'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}