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

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploads, setUploads] = useState<Upload[]>([]);

  useEffect(() => {
    fetchUploads();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchUploads, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUploads() {
    try {
      const res = await fetch('/api/upload');
      const data = await res.json();
      if (data.success) {
        setUploads(data.data);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage('PDF uploaded successfully! Processing started...');
        setFile(null);
        fetchUploads();
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
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
                Upload and manage PDF files
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
              className="px-3 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 rounded-md"
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
          {/* Upload Form */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold mb-4">Upload PDF</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800"
                />
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>

              {message && (
                <div
                  className={`rounded-md p-4 ${
                    message.includes('success')
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* Upload History */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Upload History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Filename</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Employees</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Records</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Duplicates</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Uploaded</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {uploads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
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
                        <td className="px-4 py-3 text-sm">{upload.scrapingMethod || '-'}</td>
                        <td className="px-4 py-3 text-sm">{upload.employeesCount}</td>
                        <td className="px-4 py-3 text-sm">
                          {upload.recordsCount}
                          {upload.status === 'completed' && upload.recordsCount === 0 && upload.duplicatesSkipped > 0 && (
                            <span className="ml-1 text-xs text-zinc-500">(all duplicates)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {upload.duplicatesSkipped > 0 ? (
                            <span className="text-orange-600 dark:text-orange-400">
                              {upload.duplicatesSkipped} skipped
                            </span>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(upload.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 max-w-xs truncate">
                          {upload.errorMessage || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
