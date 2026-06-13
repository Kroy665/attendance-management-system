'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface AttendanceRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  employeeType: string;
  branch: string | null;
  department: string | null;
  attendanceDate: string;
  inTime: string | null;
  outTime: string | null;
  totalHours: string | null;
  breakTime: string | null;
  overtimeHours: string | null;
  status: string | null;
  shiftTiming: string | null;
}

interface FilterOptions {
  branches: string[];
  departments: string[];
  statuses: string[];
}

export default function AttendanceTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    branches: [],
    departments: [],
    statuses: [],
  });

  // Initialize state from URL
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedBranch, setSelectedBranch] = useState(searchParams.get('branch') || '');
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  // Sort state from URL
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');

  // Pagination from URL
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchRecords();
    updateURL();
  }, [page, search, selectedBranch, selectedDepartment, selectedStatus, selectedType, startDate, endDate, sortBy, sortOrder]);

  function updateURL() {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (selectedBranch) params.set('branch', selectedBranch);
    if (selectedDepartment) params.set('department', selectedDepartment);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedType) params.set('type', selectedType);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (sortBy !== 'date') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (page !== 1) params.set('page', page.toString());

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;

    // Update URL without refreshing page
    window.history.replaceState({}, '', newURL);
  }

  async function fetchFilters() {
    try {
      const res = await fetch('/api/filters');
      const data = await res.json();
      if (data.success) {
        setFilters(data.data);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  }

  async function fetchRecords() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (search) params.append('search', search);
      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedType) params.append('type', selectedType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/attendance?${params}`);
      const data = await res.json();

      if (data.success) {
        setRecords(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setSearch(searchInput);
    setPage(1); // Reset to first page when searching
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function resetFilters() {
    setSearchInput('');
    setSearch('');
    setSelectedBranch('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setSelectedType('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  }

  function handleSort(column: string) {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting changes
  }

  function getSortIcon(column: string) {
    if (sortBy !== column) {
      return '⇅'; // Both arrows for unsorted
    }
    return sortOrder === 'asc' ? '↑' : '↓';
  }

  async function exportToCsv() {
    const csvContent = [
      ['ID', 'Name', 'Branch', 'Department', 'Date', 'In Time', 'Out Time', 'Total Hours', 'Status', 'Shift'].join(','),
      ...records.map(r => [
        r.employeeId,
        `"${r.employeeName}"`,
        `"${r.branch || ''}"`,
        `"${r.department || ''}"`,
        r.attendanceDate,
        r.inTime || '',
        r.outTime || '',
        r.totalHours || '',
        r.status || '',
        `"${r.shiftTiming || ''}"`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          {(search || selectedBranch || selectedDepartment || selectedStatus || selectedType || startDate || endDate) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {[search, selectedBranch, selectedDepartment, selectedStatus, selectedType, startDate, endDate].filter(Boolean).length} active
              </span>
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium mb-1">
              Search {search && <span className="text-blue-600 dark:text-blue-400">✓ Active</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID or Name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 px-3 py-2 border rounded-md ${
                  search
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                }`}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Branch {selectedBranch && <span className="text-blue-600 dark:text-blue-400">✓ Active</span>}
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                selectedBranch
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
              }`}
            >
              <option value="">All Branches</option>
              {filters.branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Department {selectedDepartment && <span className="text-blue-600 dark:text-blue-400">✓ Active</span>}
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                selectedDepartment
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
              }`}
            >
              <option value="">All Departments</option>
              {filters.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Status {selectedStatus && <span className="text-blue-600 dark:text-blue-400">✓ Active</span>}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                selectedStatus
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
              }`}
            >
              <option value="">All Statuses</option>
              {filters.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Type {selectedType && <span className="text-blue-600 dark:text-blue-400">✓ Active</span>}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                selectedType
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
              }`}
            >
              <option value="">All Types</option>
              <option value="employee">Employees</option>
              <option value="student">Students</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date {startDate && <span className="text-blue-600 dark:text-blue-400">✓ Active</span>}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                startDate
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End Date {endDate && <span className="text-blue-600 dark:text-blue-400">✓ Active</span>}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                endDate
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
              }`}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Reset Filters
          </button>
          <button
            onClick={exportToCsv}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Showing {records.length} of {total} records
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'employeeId' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('employeeId')}
                >
                  ID <span className="ml-1">{getSortIcon('employeeId')}</span>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'name' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('name')}
                >
                  Name <span className="ml-1">{getSortIcon('name')}</span>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'branch' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('branch')}
                >
                  Branch <span className="ml-1">{getSortIcon('branch')}</span>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'department' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('department')}
                >
                  Department <span className="ml-1">{getSortIcon('department')}</span>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'date' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('date')}
                >
                  Date <span className="ml-1">{getSortIcon('date')}</span>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'inTime' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('inTime')}
                >
                  In Time <span className="ml-1">{getSortIcon('inTime')}</span>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'outTime' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('outTime')}
                >
                  Out Time <span className="ml-1">{getSortIcon('outTime')}</span>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'totalHours' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('totalHours')}
                >
                  Total Hrs <span className="ml-1">{getSortIcon('totalHours')}</span>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 select-none ${
                    sortBy === 'status' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300' : ''
                  }`}
                  onClick={() => handleSort('status')}
                >
                  Status <span className="ml-1">{getSortIcon('status')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{record.employeeId}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          record.employeeType === 'student'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {record.employeeType === 'student' ? 'Student' : 'Employee'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{record.employeeName}</td>
                    <td className="px-4 py-3 text-sm">{record.branch || '-'}</td>
                    <td className="px-4 py-3 text-sm">{record.department || '-'}</td>
                    <td className="px-4 py-3 text-sm">{record.attendanceDate}</td>
                    <td className="px-4 py-3 text-sm">{record.inTime || '-'}</td>
                    <td className="px-4 py-3 text-sm">{record.outTime || '-'}</td>
                    <td className="px-4 py-3 text-sm">{record.totalHours || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                        {record.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case 'P':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'A':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'HD':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'W':
    case 'H':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400';
  }
}
