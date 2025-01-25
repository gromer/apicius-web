import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  total_calls: number;
}

const DEFAULT_USAGE: OpenAIUsage = {
  prompt_tokens: 0,
  completion_tokens: 0,
  total_tokens: 0,
  total_calls: 0
};

export const usageService = {
  async getUserUsage(user: User | null): Promise<OpenAIUsage> {
    try {
      if (!user) {
        return DEFAULT_USAGE;
      }

      const { data, error } = await supabase
        .from('openai_usage')
        .select('prompt_tokens, completion_tokens, total_tokens')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to fetch usage data:', error);
        return DEFAULT_USAGE;
      }

      if (!data || data.length === 0) {
        return DEFAULT_USAGE;
      }

      return data.reduce((acc, curr) => ({
        prompt_tokens: (acc.prompt_tokens || 0) + (curr.prompt_tokens || 0),
        completion_tokens: (acc.completion_tokens || 0) + (curr.completion_tokens || 0),
        total_tokens: (acc.total_tokens || 0) + (curr.total_tokens || 0),
        total_calls: (acc.total_calls || 0) + 1
      }), DEFAULT_USAGE);
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      return DEFAULT_USAGE;
    }
  }
};