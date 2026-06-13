CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" varchar(20) NOT NULL,
	"employee_name" varchar(100) NOT NULL,
	"branch" varchar(100),
	"department" varchar(200),
	"attendance_date" varchar(20) NOT NULL,
	"in_time" varchar(10),
	"out_time" varchar(10),
	"total_hours" varchar(10),
	"break_time" varchar(10),
	"overtime_hours" varchar(10),
	"status" varchar(10),
	"shift_timing" varchar(50),
	"pdf_upload_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" varchar(20) NOT NULL,
	"employee_name" varchar(100) NOT NULL,
	"branch" varchar(100),
	"department" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "pdf_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"blob_url" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"scraping_method" varchar(20),
	"employees_count" integer DEFAULT 0,
	"records_count" integer DEFAULT 0,
	"error_message" text,
	"uploaded_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
