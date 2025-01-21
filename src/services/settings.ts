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
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return DEFAULT_SETTINGS;
        }
        throw error;
      }

      return data || DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings from database:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async saveUserSettings(settings: UserSettings, userId?: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const existingSettings = await this.getUserSettings(userId);

      if (existingSettings) {
        const { error } = await supabase
          .from('user_settings')
          .update({
            display_name: settings.display_name,
            theme: settings.theme,
            avatar_url: settings.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .insert([{
            user_id: userId,
            display_name: settings.display_name,
            theme: settings.theme,
            avatar_url: settings.avatar_url
          }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to save settings to database:', error);
      throw new Error('Failed to save settings');
    }
  }
};