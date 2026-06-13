'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalEmployees: number;
  totalRecords: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  branchBreakdown: Array<{ branch: string; count: number }>;
  departmentBreakdown: Array<{ department: string; count: number }>;
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 animate-pulse">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Employees</div>
          <div className="text-3xl font-bold">{stats.totalEmployees.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Records</div>
          <div className="text-3xl font-bold">{stats.totalRecords.toLocaleString()}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Branches</div>
          <div className="text-3xl font-bold">{stats.branchBreakdown.length}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Departments</div>
          <div className="text-3xl font-bold">{stats.departmentBreakdown.length}</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
          <div className="space-y-2">
            {stats.statusBreakdown.map((item) => (
              <div key={item.status} className="flex justify-between items-center">
                <span className="text-sm">{getStatusLabel(item.status)}</span>
                <span className="font-semibold">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">Top Branches</h3>
          <div className="space-y-2">
            {stats.branchBreakdown.slice(0, 5).map((item) => (
              <div key={item.branch} className="flex justify-between items-center">
                <span className="text-sm truncate">{item.branch}</span>
                <span className="font-semibold">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">Top Departments</h3>
          <div className="space-y-2">
            {stats.departmentBreakdown.slice(0, 5).map((item) => (
              <div key={item.department} className="flex justify-between items-center">
                <span className="text-sm truncate">{item.department}</span>
                <span className="font-semibold">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'P': 'Present',
    'A': 'Absent',
    'HD': 'Half Day',
    'W': 'Weekly Off',
    'H': 'Holiday',
    'PH': 'Present on Holiday',
    'PW': 'Present on Weekend',
    'CL': 'Casual Leave',
  };
  return labels[status] || status;
}
