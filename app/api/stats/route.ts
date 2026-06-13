import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { attendanceRecords, employees } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get total employees
    const totalEmployees = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees);

    // Get total attendance records
    const totalRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendanceRecords);

    // Get status breakdown
    const statusBreakdown = await db
      .select({
        status: attendanceRecords.status,
        count: sql<number>`count(*)`,
      })
      .from(attendanceRecords)
      .groupBy(attendanceRecords.status);

    // Get branch breakdown
    const branchBreakdown = await db
      .select({
        branch: attendanceRecords.branch,
        count: sql<number>`count(*)`,
      })
      .from(attendanceRecords)
      .groupBy(attendanceRecords.branch);

    // Get department breakdown
    const departmentBreakdown = await db
      .select({
        department: attendanceRecords.department,
        count: sql<number>`count(*)`,
      })
      .from(attendanceRecords)
      .groupBy(attendanceRecords.department);

    // Get employee type breakdown from attendance records
    const typeBreakdown = await db
      .select({
        employeeType: attendanceRecords.employeeType,
        count: sql<number>`count(*)`,
      })
      .from(attendanceRecords)
      .groupBy(attendanceRecords.employeeType);

    // Get employee type breakdown from employees table (for unique individuals)
    const employeeTypeBreakdown = await db
      .select({
        employeeType: employees.employeeType,
        count: sql<number>`count(*)`,
      })
      .from(employees)
      .groupBy(employees.employeeType);

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees: Number(totalEmployees[0]?.count || 0),
        totalRecords: Number(totalRecords[0]?.count || 0),
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s.status,
          count: Number(s.count),
        })),
        branchBreakdown: branchBreakdown.map((b) => ({
          branch: b.branch,
          count: Number(b.count),
        })),
        departmentBreakdown: departmentBreakdown.map((d) => ({
          department: d.department,
          count: Number(d.count),
        })),
        typeBreakdown: typeBreakdown.map((t) => ({
          employeeType: t.employeeType,
          count: Number(t.count),
        })),
        employeeTypeBreakdown: employeeTypeBreakdown.map((t) => ({
          employeeType: t.employeeType,
          count: Number(t.count),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
