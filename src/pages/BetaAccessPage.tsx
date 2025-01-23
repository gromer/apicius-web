import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ChefHat, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { apiClient } from '../services/api';

interface Screenshot {
  id: number;
  url: string;
  alt: string;
  description: string;
}

// Placeholder screenshots - these will be replaced with actual screenshots later
const screenshots: Screenshot[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Recipe Management',
    description: 'Easily manage your recipes with our intuitive interface'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Recipe Import',
    description: 'Import recipes from images or text with AI-powered extraction'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    alt: 'Recipe Organization',
    description: 'Organize your recipes with tags and categories'
  }
];

export function BetaAccessPage() {
  const { user } = useUser();
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/import" replace />;
  }

  const handleBetaRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      //await betaService.requestAccess(email);
      await apiClient.addBetaUser({ email });
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      setError('Failed to submit beta request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sign In Button */}
      <div className="absolute top-0 right-0 p-4 z-50">
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
        >
          Sign In
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-8">
                  <ChefHat className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  <h1 className="ml-4 text-4xl font-extrabold text-gray-900 dark:text-white">
                    Apicius
                  </h1>
                </div>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Your personal AI-powered recipe management system. Extract recipes from images or text,
                  organize your collection, and access your recipes from anywhere.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a
                      href="#request-access"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 md:py-4 md:text-lg md:px-10"
                    >
                      Request Beta Access
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Manage your recipes with ease
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {screenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="relative rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => setSelectedImage(screenshot)}
                >
                  <img
                    src={screenshot.url}
                    alt={screenshot.alt}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                    <div className="p-4 text-white">
                      <p className="font-medium">{screenshot.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Beta Request Form */}
      <div id="request-access" className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">
              Request Beta Access
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 text-center">
              Join our private beta and be among the first to try Apicius.
            </p>

            {submitted ? (
              <div className="mt-8 bg-green-50 dark:bg-green-900/50 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-200 text-center">
                  Thanks for your interest! We'll be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBetaRequest} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Access'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                  onClick={() => setSelectedImage(null)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.alt}
                    className="w-full rounded-lg"
                  />
                  <div className="mt-4">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedImage.alt}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {selectedImage.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}