import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserSettings } from '../components/UserSettings';
import { useDarkMode } from '../hooks/useDarkMode';

export function SettingsPage() {
  const { user } = useUser();
  const [isDark, setIsDark] = useDarkMode();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <UserSettings isDark={isDark} onThemeChange={setIsDark} />;
}