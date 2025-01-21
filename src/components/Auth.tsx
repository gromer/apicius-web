import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/supabase';

export function Auth() {
  return (
    <div className="max-w-md mx-auto">
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#4F46E5',
                brandAccent: '#4338CA',
              },
            },
            dark: {
              colors: {
                brand: '#6366F1',
                brandAccent: '#818CF8',
              },
            },
          },
          style: {
            button: {
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 16px',
            },
            container: {
              gap: '16px',
            },
          },
        }}
        providers={[]}
        view="sign_in"
        showLinks={true}
      />
    </div>
  );
}