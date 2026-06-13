'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import StatsDashboard from '@/components/stats-dashboard';

export default function AdminStatsPage() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Admin Dashboard
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Detailed statistics and analytics
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                View Public Site
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-red-600 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <Link
              href="/admin/overview"
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
            >
              Overview
            </Link>
            <Link
              href="/admin/upload"
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
            >
              Upload PDF
            </Link>
            <Link
              href="/admin/stats"
              className="px-3 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 rounded-md"
            >
              Statistics
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Attendance Statistics</h2>
            <StatsDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
