'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 border border-red-700">
        <h2 className="text-2xl font-bold mb-4">⚠️ Something went wrong</h2>
        <p className="text-gray-300 mb-6">
          {error.message || 'An unexpected error occurred while loading the dashboard.'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold transition"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded font-semibold transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
