import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendanceRecords } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get unique branches
    const branches = await db
      .selectDistinct({ branch: attendanceRecords.branch })
      .from(attendanceRecords)
      .where(sql`${attendanceRecords.branch} IS NOT NULL AND ${attendanceRecords.branch} != ''`);

    // Get unique departments
    const departments = await db
      .selectDistinct({ department: attendanceRecords.department })
      .from(attendanceRecords)
      .where(sql`${attendanceRecords.department} IS NOT NULL AND ${attendanceRecords.department} != ''`);

    // Get unique statuses
    const statuses = await db
      .selectDistinct({ status: attendanceRecords.status })
      .from(attendanceRecords)
      .where(sql`${attendanceRecords.status} IS NOT NULL AND ${attendanceRecords.status} != ''`);

    return NextResponse.json({
      success: true,
      data: {
        branches: branches.map((b) => b.branch).filter(Boolean),
        departments: departments.map((d) => d.department).filter(Boolean),
        statuses: statuses.map((s) => s.status).filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
