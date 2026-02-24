'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LoginPage() {
  const [mitidButtonLoading, setMitidButtonLoading] = useState(false);

  const handleMitidLogin = () => {
    setMitidButtonLoading(true);
    // TODO: Implement MitID OIDC flow
    // This will redirect to MitID authentication
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">VAT Registration</h1>
        <p className="text-gray-600 mb-8">Sign in to continue</p>

        <div className="space-y-4">
          <Button
            onClick={handleMitidLogin}
            disabled={mitidButtonLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {mitidButtonLoading ? 'Loading...' : 'Sign in with MitID'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>
              Don't have MitID? 
              <a 
                href="https://www.mitid.dk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline ml-1"
              >
                Get it here
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
