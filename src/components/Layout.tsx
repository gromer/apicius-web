import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, LogOut, Settings, PlusCircle, Menu, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Avatar } from './Avatar';
import { AvatarPopup } from './AvatarPopup';
import { RecipeList } from './RecipeList';
import { supabase } from '../services/supabase';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userSettings } = useUser();
  const [showAvatarPopup, setShowAvatarPopup] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const Sidebar = () => (
    <>
      {/* New Recipe Button */}
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/import')}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Recipe
        </button>
      </div>

      {/* Recipe List - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <RecipeList
          onRecipeSelect={(id) => navigate(`/recipes/${id}`)}
          selectedRecipeId={location.pathname.startsWith('/recipes/') ? location.pathname.split('/').pop() : null}
        />
      </div>

      {/* Settings Button - Fixed at bottom */}
      <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md ${
            location.pathname === '/settings'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900`}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex-none bg-white dark:bg-gray-800 shadow">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>

            <button
              onClick={() => navigate('/import')}
              className="flex-shrink-0 flex items-center group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-lg px-2 py-1 -ml-2"
            >
              <ChefHat className="h-12 w-12 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors" />
              <div className="ml-4 text-left hidden sm:block">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                  Apicius
                </h1>
                <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
                  Upload a screenshot of a recipe or paste recipe text
                </p>
              </div>
            </button>
            <div className="flex-shrink-0 flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowAvatarPopup(!showAvatarPopup)}
                  className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 rounded-full"
                >
                  <Avatar
                    url={userSettings?.avatar_url}
                    displayName={userSettings?.display_name}
                    size="sm"
                  />
                </button>
                <AvatarPopup
                  isOpen={showAvatarPopup}
                  onClose={() => setShowAvatarPopup(false)}
                />
              </div>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile menu drawer */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
          aria-hidden="true"
        >
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative flex flex-col w-80 max-w-xs h-full bg-white dark:bg-gray-800">
            <Sidebar />
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-80 flex-none bg-white dark:bg-gray-800 shadow-lg h-full">
          <Sidebar />
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}