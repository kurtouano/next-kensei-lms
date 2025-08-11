"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        
        <Link 
          href="/" 
          className="inline-block bg-[#4a7c59] text-white px-6 py-3 rounded-lg hover:bg-[#3a6147] transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}


