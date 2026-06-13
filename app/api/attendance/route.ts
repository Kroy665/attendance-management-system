import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendanceRecords, employees } from '@/lib/db/schema';
import { eq, and, like, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get('search');
    const branch = searchParams.get('branch');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    console.log('Search params:', { search, branch, department, status, startDate, endDate, sortBy, sortOrder, page, limit });

    // Build where conditions
    const conditions = [];

    if (search) {
      // Make search case-insensitive by using ILIKE (PostgreSQL)
      conditions.push(
        or(
          sql`${attendanceRecords.employeeId} ILIKE ${`%${search}%`}`,
          sql`${attendanceRecords.employeeName} ILIKE ${`%${search}%`}`
        )
      );
    }

    if (branch) {
      conditions.push(eq(attendanceRecords.branch, branch));
    }

    if (department) {
      conditions.push(eq(attendanceRecords.department, department));
    }

    if (status) {
      conditions.push(eq(attendanceRecords.status, status));
    }

    // Date filtering - convert DD-MMM-YYYY format to date for comparison
    // Dates in DB are stored as "11-May-2026", input dates are "2026-05-11"
    if (startDate) {
      conditions.push(
        sql`TO_DATE(${attendanceRecords.attendanceDate}, 'DD-Mon-YYYY') >= TO_DATE(${startDate}, 'YYYY-MM-DD')`
      );
    }

    if (endDate) {
      conditions.push(
        sql`TO_DATE(${attendanceRecords.attendanceDate}, 'DD-Mon-YYYY') <= TO_DATE(${endDate}, 'YYYY-MM-DD')`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    console.log('Where conditions count:', conditions.length);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendanceRecords)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);
    console.log('Total records found:', total);

    // Map sort column names to database fields
    const sortColumnMap: Record<string, any> = {
      'employeeId': attendanceRecords.employeeId,
      'name': attendanceRecords.employeeName,
      'branch': attendanceRecords.branch,
      'department': attendanceRecords.department,
      'date': attendanceRecords.attendanceDate,
      'inTime': attendanceRecords.inTime,
      'outTime': attendanceRecords.outTime,
      'totalHours': attendanceRecords.totalHours,
      'status': attendanceRecords.status,
    };

    const sortColumn = sortColumnMap[sortBy] || attendanceRecords.attendanceDate;

    // Build order by clause
    let orderByClause;
    if (sortBy === 'date') {
      // For date sorting, convert to proper date format
      orderByClause = sortOrder === 'asc'
        ? sql`TO_DATE(${attendanceRecords.attendanceDate}, 'DD-Mon-YYYY') ASC`
        : sql`TO_DATE(${attendanceRecords.attendanceDate}, 'DD-Mon-YYYY') DESC`;
    } else {
      // For other columns, use standard sorting
      orderByClause = sortOrder === 'asc'
        ? sql`${sortColumn} ASC`
        : sql`${sortColumn} DESC`;
    }

    // Get paginated records
    const records = await db
      .select()
      .from(attendanceRecords)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(orderByClause);

    console.log('Records returned:', records.length);

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}
