'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch applications from API
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">VAT Applications</h1>
          <Link href="/dashboard/applications/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              New Application
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No applications yet</p>
            <Link href="/dashboard/applications/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Create Your First Application
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map((app: any) => (
              <div key={app.id} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold">{app.id}</h2>
                <p className="text-gray-600">Status: {app.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
