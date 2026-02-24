'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">VAT Registration</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Register for Danish VAT
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A simple and secure way to register your business for VAT in Denmark
          </p>
          
          <div className="space-y-4">
            <Link href="/auth/login">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
