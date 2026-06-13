import Link from 'next/link';
import { Suspense } from 'react';
import AttendanceTable from '@/components/attendance-table';
import StatsDashboard from '@/components/stats-dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Attendance Management System
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                View and filter attendance records
              </p>
            </div>
            <Link
              href="/admin/login"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Statistics Dashboard */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <StatsDashboard />
          </div>

          {/* Attendance Records */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
            <Suspense fallback={<div className="text-center py-8">Loading attendance records...</div>}>
              <AttendanceTable />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Powered by Next.js and E2B
          </p>
        </div>
      </footer>
    </div>
  );
}
