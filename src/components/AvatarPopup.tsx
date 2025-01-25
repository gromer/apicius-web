import React, { useEffect, useState } from 'react';
import { usageService, OpenAIUsage } from '../services/usage';
import { Brain } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface AvatarPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarPopup({ isOpen, onClose }: AvatarPopupProps) {
  const { user, userSettings } = useUser();
  const [usage, setUsage] = useState<OpenAIUsage | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsage();
    }
  }, [isOpen, user]);

  const loadUsage = async () => {
    try {
      const data = await usageService.getUserUsage(user);
      setUsage(data);
    } catch (err) {
      console.error('Failed to load usage data:', err);
      setUsage(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-4 top-16 z-50 w-72 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {userSettings?.display_name ? `Hi, ${userSettings.display_name}!` : 'Hey there!'}
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Brain className="h-4 w-4" />
            <span className="font-medium">OpenAI Usage</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Calls</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {usage?.total_calls?.toLocaleString() ?? '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Tokens</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {usage?.total_tokens?.toLocaleString() ?? '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Prompt Tokens</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {usage?.prompt_tokens?.toLocaleString() ?? '0'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Completion Tokens</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {usage?.completion_tokens?.toLocaleString() ?? '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}