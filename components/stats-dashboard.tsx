'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalEmployees: number;
  totalRecords: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  branchBreakdown: Array<{ branch: string; count: number }>;
  departmentBreakdown: Array<{ department: string; count: number }>;
  typeBreakdown: Array<{ employeeType: string; count: number }>;
  employeeTypeBreakdown: Array<{ employeeType: string; count: number }>;
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
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Individuals</div>
          <div className="text-3xl font-bold">{stats.totalEmployees.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Employees + Students</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Attendance Records</div>
          <div className="text-3xl font-bold">{stats.totalRecords.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Total entries</div>
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

      {/* Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">By Type (Individuals)</h3>
          <div className="space-y-4">
            {stats.employeeTypeBreakdown?.map((item) => {
              const percentage = stats.totalEmployees ? (item.count / stats.totalEmployees) * 100 : 0;
              return (
                <div key={item.employeeType}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.employeeType === 'student'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {item.employeeType === 'student' ? 'Student' : 'Employee'}
                      </span>
                      <span className="text-sm capitalize">{item.employeeType}s</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.count.toLocaleString()}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        item.employeeType === 'student'
                          ? 'bg-purple-600 dark:bg-purple-500'
                          : 'bg-blue-600 dark:bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) || (
              <div className="text-sm text-zinc-500">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {stats.statusBreakdown.map((item) => {
              const maxCount = Math.max(...stats.statusBreakdown.map(s => s.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{getStatusLabel(item.status)}</span>
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Branch & Department Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">Top Branches</h3>
          <div className="space-y-3">
            {stats.branchBreakdown.slice(0, 5).map((item) => {
              const maxCount = Math.max(...stats.branchBreakdown.slice(0, 5).map(b => b.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.branch}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate max-w-[200px]">{item.branch}</span>
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">Top Departments</h3>
          <div className="space-y-3">
            {stats.departmentBreakdown.slice(0, 5).map((item) => {
              const maxCount = Math.max(...stats.departmentBreakdown.slice(0, 5).map(d => d.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.department}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate max-w-[200px]">{item.department}</span>
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
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
