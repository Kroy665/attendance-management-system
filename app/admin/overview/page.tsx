'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface Upload {
  id: number;
  filename: string;
  originalName: string;
  status: string;
  scrapingMethod: string | null;
  employeesCount: number;
  recordsCount: number;
  duplicatesSkipped: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface Stats {
  totalEmployees: number;
  totalRecords: number;
  totalUploads: number;
  completedUploads: number;
  failedUploads: number;
  pendingUploads: number;
  totalDuplicatesSkipped: number;
  employeeCount: number;
  studentCount: number;
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [uploadsRes, statsRes] = await Promise.all([
        fetch('/api/upload'),
        fetch('/api/stats'),
      ]);

      const uploadsData = await uploadsRes.json();
      const statsData = await statsRes.json();

      if (uploadsData.success) {
        setUploads(uploadsData.data.slice(0, 5)); // Get latest 5 uploads

        // Calculate upload stats
        const totalUploads = uploadsData.data.length;
        const completedUploads = uploadsData.data.filter((u: Upload) => u.status === 'completed').length;
        const failedUploads = uploadsData.data.filter((u: Upload) => u.status === 'failed').length;
        const pendingUploads = uploadsData.data.filter((u: Upload) => u.status === 'pending' || u.status === 'processing').length;
        const totalDuplicatesSkipped = uploadsData.data.reduce((sum: number, u: Upload) => sum + (u.duplicatesSkipped || 0), 0);

        // Calculate employee/student counts from employeeTypeBreakdown (unique individuals)
        const employeeTypeBreakdown = statsData.success ? statsData.data.employeeTypeBreakdown : [];
        const employeeCount = employeeTypeBreakdown.find((t: any) => t.employeeType === 'employee')?.count || 0;
        const studentCount = employeeTypeBreakdown.find((t: any) => t.employeeType === 'student')?.count || 0;

        setStats({
          totalEmployees: statsData.success ? statsData.data.totalEmployees : 0,
          totalRecords: statsData.success ? statsData.data.totalRecords : 0,
          totalUploads,
          completedUploads,
          failedUploads,
          pendingUploads,
          totalDuplicatesSkipped,
          employeeCount,
          studentCount,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

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
                Overview and system metrics
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
              className="px-3 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 rounded-md"
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
              className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
            >
              Statistics
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Key Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Individuals</div>
                <div className="text-3xl font-bold">{stats?.totalEmployees.toLocaleString() || 0}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Employees + Students</div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Attendance Records</div>
                <div className="text-3xl font-bold">{stats?.totalRecords.toLocaleString() || 0}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Total entries</div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Uploads</div>
                <div className="text-3xl font-bold">{stats?.totalUploads || 0}</div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Duplicates Prevented</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats?.totalDuplicatesSkipped || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Employee/Student Breakdown */}
          <div>
            <h2 className="text-xl font-semibold mb-4">By Type (Individuals)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Employees</div>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Employee
                  </span>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.employeeCount || 0}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                  {stats?.totalEmployees ? ((stats.employeeCount / stats.totalEmployees) * 100).toFixed(1) : 0}% of total individuals
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Students</div>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    Student
                  </span>
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats?.studentCount || 0}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                  {stats?.totalEmployees ? ((stats.studentCount / stats.totalEmployees) * 100).toFixed(1) : 0}% of total individuals
                </div>
              </div>
            </div>
          </div>

          {/* Upload Status */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.completedUploads || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Pending/Processing</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.pendingUploads || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Failed</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats?.failedUploads || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Uploads</h2>
              <Link
                href="/admin/upload"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Filename</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Records</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Duplicates</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {uploads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                          No uploads yet
                        </td>
                      </tr>
                    ) : (
                      uploads.map((upload) => (
                        <tr key={upload.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                          <td className="px-4 py-3 text-sm">{upload.originalName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(upload.status)}`}>
                              {upload.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{upload.recordsCount}</td>
                          <td className="px-4 py-3 text-sm">
                            {upload.duplicatesSkipped > 0 ? (
                              <span className="text-orange-600 dark:text-orange-400">
                                {upload.duplicatesSkipped}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(upload.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/upload"
                className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="text-lg font-semibold mb-2">Upload New PDF</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Process attendance data from PDF files
                </div>
              </Link>

              <Link
                href="/admin/stats"
                className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="text-lg font-semibold mb-2">View Statistics</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Detailed analytics and breakdowns
                </div>
              </Link>

              <Link
                href="/"
                className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="text-lg font-semibold mb-2">View Attendance</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Browse all attendance records
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400';
  }
}
