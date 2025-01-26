import { supabase } from './supabase';

interface UserSettings {
  display_name: string | null;
  theme: 'light' | 'dark' | 'system';
  avatar_url: string | null;
}

const DEFAULT_SETTINGS: UserSettings = {
  display_name: null,
  theme: 'system',
  avatar_url: null
};

export const settingsService = {
  async getUserSettings(userId?: string): Promise<UserSettings> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('display_name, theme, avatar_url')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) {
        console.error('Failed to load settings:', error);
        return DEFAULT_SETTINGS;
      }

      return data || DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async saveUserSettings(settings: UserSettings, userId?: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const { error: upsertError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          display_name: settings.display_name,
          theme: settings.theme,
          avatar_url: settings.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }
};