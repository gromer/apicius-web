import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  total_calls: number;
}

export const usageService = {
  async getUserUsage(user: User | null): Promise<OpenAIUsage> {
    try {
      let query = supabase
        .from('openai_usage')
        .select('prompt_tokens, completion_tokens, total_tokens');

      // If user is authenticated, get their usage
      // If not authenticated, get anonymous usage
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch usage data:', error);
        return {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          total_calls: 0
        };
      }

      return data.reduce((acc, curr) => ({
        prompt_tokens: acc.prompt_tokens + curr.prompt_tokens,
        completion_tokens: acc.completion_tokens + curr.completion_tokens,
        total_tokens: acc.total_tokens + curr.total_tokens,
        total_calls: acc.total_calls + 1
      }), {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        total_calls: 0
      });
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      return {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        total_calls: 0
      };
    }
  }
};