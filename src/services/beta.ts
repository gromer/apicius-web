import { supabase } from './supabase';

export const betaService = {
  async requestAccess(email: string): Promise<void> {
    try {
      // First check if the email already exists
      const { data: existingRequest } = await supabase
        .from('beta_requests')
        .select('id')
        .eq('email', email)
        .single();

      // If the email already exists, just return successfully
      if (existingRequest) {
        return;
      }

      // If the email doesn't exist, insert the new request
      const { error } = await supabase
        .from('beta_requests')
        .insert([
          {
            email,
            status: 'requested'
          }
        ]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to submit beta request:', error);
      throw new Error('Failed to submit beta request');
    }
  }
};