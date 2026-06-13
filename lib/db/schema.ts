import { pgTable, serial, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core';

// Admin users table
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Employees table
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  employeeId: varchar('employee_id', { length: 20 }).notNull().unique(),
  employeeName: varchar('employee_name', { length: 100 }).notNull(),
  branch: varchar('branch', { length: 100 }),
  department: varchar('department', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Attendance records table
export const attendanceRecords = pgTable('attendance_records', {
  id: serial('id').primaryKey(),
  employeeId: varchar('employee_id', { length: 20 }).notNull(),
  employeeName: varchar('employee_name', { length: 100 }).notNull(),
  branch: varchar('branch', { length: 100 }),
  department: varchar('department', { length: 200 }),
  attendanceDate: varchar('attendance_date', { length: 20 }).notNull(),
  inTime: varchar('in_time', { length: 10 }),
  outTime: varchar('out_time', { length: 10 }),
  totalHours: varchar('total_hours', { length: 10 }),
  breakTime: varchar('break_time', { length: 10 }),
  overtimeHours: varchar('overtime_hours', { length: 10 }),
  status: varchar('status', { length: 10 }),
  shiftTiming: varchar('shift_timing', { length: 50 }),
  pdfUploadId: integer('pdf_upload_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// PDF uploads table - track all PDF uploads and their processing status
export const pdfUploads = pgTable('pdf_uploads', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  blobUrl: text('blob_url'), // Vercel Blob URL if scraping fails
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed
  scrapingMethod: varchar('scraping_method', { length: 20 }), // e2b, fallback, manual
  employeesCount: integer('employees_count').default(0),
  recordsCount: integer('records_count').default(0),
  duplicatesSkipped: integer('duplicates_skipped').default(0),
  errorMessage: text('error_message'),
  uploadedBy: varchar('uploaded_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Types
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;

export type PdfUpload = typeof pdfUploads.$inferSelect;
export type NewPdfUpload = typeof pdfUploads.$inferInsert;
