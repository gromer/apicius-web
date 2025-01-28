import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { settingsService } from '../services/settings';
import { useNavigate } from 'react-router-dom';

interface UserSettings {
  display_name: string | null;
  theme: 'light' | 'dark' | 'system';
  avatar_url: string | null;
}

interface UserContextType {
  user: User | null;
  userSettings: UserSettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userSettings: null,
  isLoading: true,
  refreshSettings: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadUserSettings = async (userId?: string) => {
    try {
      if (userId) {
        const settings = await settingsService.getUserSettings(userId);
        setUserSettings(settings);
      }
    } catch (err) {
      console.error('Failed to load user settings:', err);
      setUserSettings(null);
    }
  };

  const clearUserData = () => {
    setUser(null);
    setUserSettings(null);
    // Clear local storage
    localStorage.clear();
  };

  const refreshSettings = async () => {
    await loadUserSettings(user?.id);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserSettings(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);

      if (event === 'INITIAL_SESSION') {
        // handle initial session
      } else if (event === 'SIGNED_IN') {
        // handle sign in event
      } else if (event === 'SIGNED_OUT') {
        // User logged out - clear everything
        clearUserData();
        navigate('/login');
      } else if (event === 'PASSWORD_RECOVERY') {
        // Redirect to change password page when password recovery is initiated
        navigate('/change-password');
      } else if (event === 'TOKEN_REFRESHED') {
        // handle token refreshed event
      } else if (event === 'USER_UPDATED') {
        // handle user updated event
      }
      
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      if (newUser) {
        // User logged in - load their settings
        loadUserSettings(newUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const value = {
    user,
    userSettings,
    isLoading,
    refreshSettings,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}