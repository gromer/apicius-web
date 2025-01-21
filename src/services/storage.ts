import { supabase } from './supabase';

export const storageService = {
  async uploadAvatar(file: File, userId?: string): Promise<string> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Delete any existing avatar first
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        await Promise.all(
          existingFiles.map(file => 
            supabase.storage
              .from('avatars')
              .remove([`${userId}/${file.name}`])
          )
        );
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error('Failed to get public URL for avatar');
      }

      return data.publicUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  }
};