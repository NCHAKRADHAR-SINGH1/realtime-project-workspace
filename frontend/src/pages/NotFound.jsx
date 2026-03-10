import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-indigo-200 select-none">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
