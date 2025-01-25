import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Auth } from '../components/Auth';

export function LoginPage() {
  const { user } = useUser();
  const location = useLocation();
  const message = location.state?.message;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <ChefHat className="mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to Apicius
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your personal recipe manager
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-md bg-green-50 dark:bg-green-900/50 p-4">
            <p className="text-sm text-green-700 dark:text-green-200">{message}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth />
        </div>
      </div>
    </div>
  );
}