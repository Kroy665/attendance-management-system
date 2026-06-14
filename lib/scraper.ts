import { Sandbox } from 'e2b';
import { put } from '@vercel/blob';
import { db } from './db';
import { employees, attendanceRecords, pdfUploads } from './db/schema';
import { eq, and } from 'drizzle-orm';

interface ScraperResult {
  success: boolean;
  employeesCount: number;
  recordsCount: number;
  duplicatesSkipped?: number;
  error?: string;
  scrapingMethod: 'e2b' | 'fallback';
}

export async function processPdfWithE2B(
  pdfBuffer: Buffer,
  filename: string,
  uploadId: number
): Promise<ScraperResult> {
  let sandbox: Sandbox | null = null;

  try {
    console.log('Starting e2b sandbox for:', filename);

    // Update status to processing
    await db
      .update(pdfUploads)
      .set({ status: 'processing', scrapingMethod: 'e2b' })
      .where(eq(pdfUploads.id, uploadId));

    sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
      metadata: {
        template: 'base',
      },
    });

    console.log('Sandbox created, uploading files...');

    // Read the Python script from the pdf-scraper directory
    const fs = await import('fs');
    const path = await import('path');
    const pythonScriptPath = path.join(
      process.cwd(),
      './main.py'
    );

    if (!fs.existsSync(pythonScriptPath)) {
      throw new Error('Python scraper script not found');
    }

    const pythonScript = fs.readFileSync(pythonScriptPath, 'utf-8');

    // Upload Python script
    await sandbox.files.write('/home/user/main.py', pythonScript);

    // Upload PDF
    await sandbox.files.write(
      `/home/user/${filename}`,
      pdfBuffer.buffer.slice(
        pdfBuffer.byteOffset,
        pdfBuffer.byteOffset + pdfBuffer.byteLength
      ) as ArrayBuffer
    );

    // Install dependencies
    console.log('Installing dependencies...');
    await sandbox.commands.run('pip install pdfplumber');

    // Run the scraper
    console.log('Running scraper...');
    const runResult = await sandbox.commands.run(`python main.py "${filename}"`);

    if (runResult.exitCode !== 0) {
      throw new Error(
        `Scraper failed: ${runResult.stderr || 'Unknown error'}`
      );
    }

    // Download the output files
    const baseName = filename.replace('.pdf', '');
    const dbReadyFile = `${baseName}_db_ready.json`;

    const dbReadyContent = await sandbox.files.read(`/home/user/${dbReadyFile}`);
    const parsedData = JSON.parse(dbReadyContent);

    // Save to database
    const result = await saveToDatabase(parsedData, uploadId);

    // Update upload status
    await db
      .update(pdfUploads)
      .set({
        status: 'completed',
        employeesCount: result.employeesCount,
        recordsCount: result.recordsCount,
        duplicatesSkipped: result.duplicatesSkipped,
        completedAt: new Date(),
      })
      .where(eq(pdfUploads.id, uploadId));

    return {
      success: true,
      employeesCount: result.employeesCount,
      recordsCount: result.recordsCount,
      duplicatesSkipped: result.duplicatesSkipped,
      scrapingMethod: 'e2b',
    };
  } catch (error) {
    console.error('E2B scraping error:', error);

    // Try fallback to Vercel Blob
    return await fallbackToBlobStorage(pdfBuffer, filename, uploadId);
  } finally {
    if (sandbox) {
      await sandbox.kill();
    }
  }
}

async function fallbackToBlobStorage(
  pdfBuffer: Buffer,
  filename: string,
  uploadId: number
): Promise<ScraperResult> {
  try {
    console.log('E2B failed, storing PDF in Vercel Blob...');

    // Upload to Vercel Blob
    const blob = await put(filename, pdfBuffer, {
      access: 'public',
    });

    // Update upload record
    await db
      .update(pdfUploads)
      .set({
        status: 'failed',
        scrapingMethod: 'fallback',
        blobUrl: blob.url,
        errorMessage: 'E2B scraping failed, PDF stored for manual processing',
      })
      .where(eq(pdfUploads.id, uploadId));

    return {
      success: false,
      employeesCount: 0,
      recordsCount: 0,
      error: 'E2B scraping failed, PDF stored for manual processing',
      scrapingMethod: 'fallback',
    };
  } catch (blobError) {
    console.error('Blob storage error:', blobError);

    await db
      .update(pdfUploads)
      .set({
        status: 'failed',
        errorMessage: 'Both E2B and blob storage failed',
      })
      .where(eq(pdfUploads.id, uploadId));

    return {
      success: false,
      employeesCount: 0,
      recordsCount: 0,
      error: 'Both E2B and blob storage failed',
      scrapingMethod: 'fallback',
    };
  }
}

// Helper function to determine employee type from ID
function getEmployeeType(employeeId: string): 'employee' | 'student' {
  if (employeeId.startsWith('DS')) {
    return 'student';
  } else if (employeeId.startsWith('E')) {
    return 'employee';
  }
  // Default to employee for unknown patterns
  return 'employee';
}

async function saveToDatabase(
  data: any,
  uploadId: number
): Promise<{ employeesCount: number; recordsCount: number; duplicatesSkipped: number }> {
  // Insert employees
  for (const emp of data.employees) {
    const employeeType = getEmployeeType(emp.employee_id);

    await db
      .insert(employees)
      .values({
        employeeId: emp.employee_id,
        employeeName: emp.employee_name,
        employeeType,
        branch: emp.branch,
        department: emp.department,
      })
      .onConflictDoUpdate({
        target: employees.employeeId,
        set: {
          employeeName: emp.employee_name,
          employeeType,
          branch: emp.branch,
          department: emp.department,
          updatedAt: new Date(),
        },
      });
  }

  // Insert attendance records with duplicate checking
  let recordsInserted = 0;
  let duplicatesSkipped = 0;

  for (const record of data.attendance) {
    // Check if record already exists (same employee + same date)
    const existingRecord = await db.query.attendanceRecords.findFirst({
      where: and(
        eq(attendanceRecords.employeeId, record.employee_id),
        eq(attendanceRecords.attendanceDate, record.attendance_date)
      ),
    });

    if (existingRecord) {
      console.log(`Skipping duplicate: ${record.employee_id} on ${record.attendance_date}`);
      duplicatesSkipped++;
      continue;
    }

    // Insert new record
    const employeeType = getEmployeeType(record.employee_id);

    await db.insert(attendanceRecords).values({
      employeeId: record.employee_id,
      employeeName: record.employee_name,
      employeeType,
      branch: record.branch,
      department: record.department,
      attendanceDate: record.attendance_date,
      inTime: record.in_time,
      outTime: record.out_time,
      totalHours: record.total_hours,
      breakTime: record.break_time,
      overtimeHours: record.overtime_hours,
      status: record.status,
      shiftTiming: record.shift_timing,
      pdfUploadId: uploadId,
    });
    recordsInserted++;
  }

  return {
    employeesCount: data.employees.length,
    recordsCount: recordsInserted,
    duplicatesSkipped,
  };
}
