# PDF Scrape - Attendance Management System

A Next.js application for managing and viewing attendance data extracted from PDF files using E2B sandboxed scraping.

## Features

### Public Features (No Login Required)
- ✅ View all attendance records in a searchable, filterable table
- ✅ Filter by date range, employee name/ID, branch, department, and status
- ✅ Export data to CSV
- ✅ View statistics dashboard with overview metrics
- ✅ Responsive design with dark mode support

### Admin Features (Login Required)
- ✅ Upload PDF files for automated scraping
- ✅ E2B sandbox-based PDF processing with pdfplumber
- ✅ Automatic fallback to Vercel Blob storage if scraping fails
- ✅ View upload history with processing status
- ✅ Real-time status updates on upload processing

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5
- **PDF Processing**: E2B Sandbox + pdfplumber
- **File Storage**: Vercel Blob (fallback)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Getting Started

### 1. Prerequisites

- Node.js 20+ installed
- A Neon database account (https://neon.tech)
- An E2B account (https://e2b.dev)
- A Vercel account (for Blob storage)

### 2. Clone and Install

```bash
cd pdf-scrape-nextjs
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in the following:

```env
# Database - Get from Neon dashboard
DATABASE_URL=postgresql://...

# NextAuth - Generate a random secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# E2B - Get from https://e2b.dev/dashboard
E2B_API_KEY=your-e2b-api-key

# Vercel Blob - Get from Vercel dashboard
BLOB_READ_WRITE_TOKEN=your-blob-token

# Admin credentials (for initial setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Database Setup

Push the database schema to Neon:

```bash
npm run db:push
```

Create the initial admin user:

```bash
npm run db:setup
```

This will create an admin user with the email and password specified in your `.env.local` file.

### 5. Run Development Server

```bash
npm run dev
```

Visit:
- **Public site**: http://localhost:3000
- **Admin login**: http://localhost:3000/admin/login
- **Admin upload**: http://localhost:3000/admin/upload (after login)

## Database Schema

### Tables

1. **admins** - Admin users for authentication
2. **employees** - Unique employee records
3. **attendance_records** - Individual attendance entries
4. **pdf_uploads** - Track PDF upload status and processing

### Status Codes

Attendance status codes used in the system:
- `P` - Present
- `A` - Absent
- `HD` - Half Day
- `W` - Weekly Off
- `H` - Holiday
- `PH` - Present on Holiday
- `PW` - Present on Weekend
- `CL` - Casual Leave

## How It Works

### PDF Upload & Processing Flow

1. **Admin uploads PDF** via `/admin/upload`
2. **Record created** in `pdf_uploads` table with status "pending"
3. **E2B sandbox launched** with Python environment
4. **Python scraper** (`pdf-scraper/main.py`) runs in sandbox using pdfplumber
5. **Data extracted** in JSON format (employees + attendance records)
6. **Saved to database** with status "completed"
7. **If E2B fails**, PDF stored in Vercel Blob for manual processing

### Data Flow

```
PDF Upload → E2B Sandbox → pdfplumber → JSON → Database
                ↓ (if fails)
           Vercel Blob Storage
```

## API Routes

### Public APIs
- `GET /api/attendance` - Get attendance records (with filters)
- `GET /api/stats` - Get statistics dashboard data
- `GET /api/filters` - Get available filter options

### Admin APIs (Protected)
- `POST /api/upload` - Upload PDF file
- `GET /api/upload` - Get upload history

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run db:setup     # Create initial admin user
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Don't forget to:
- Run `npm run db:push` to set up production database
- Run `npm run db:setup` to create admin user (use Vercel CLI or add as a function)

## File Structure

```
pdf-scrape-nextjs/
├── app/
│   ├── page.tsx                    # Public home page
│   ├── admin/
│   │   ├── login/page.tsx         # Admin login
│   │   └── upload/page.tsx        # Admin upload dashboard
│   └── api/
│       ├── auth/[...nextauth]/    # NextAuth endpoints
│       ├── attendance/            # Public attendance API
│       ├── stats/                 # Statistics API
│       ├── filters/               # Filter options API
│       └── upload/                # Upload API (admin)
├── components/
│   ├── attendance-table.tsx       # Main attendance table with filters
│   └── stats-dashboard.tsx        # Statistics dashboard
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── scraper.ts                 # E2B scraper integration
│   ├── utils.ts                   # Utility functions
│   └── db/
│       ├── index.ts               # Database client
│       ├── schema.ts              # Drizzle schema
│       └── setup.ts               # Admin setup script
└── middleware.ts                  # Route protection
```

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check Neon dashboard for database status
- Ensure IP allowlist includes your location (Neon free tier)

### E2B Scraping Fails
- Verify `E2B_API_KEY` is correct
- Check E2B dashboard for quota/usage
- PDFs will be stored in Vercel Blob as fallback

### Admin Login Not Working
- Run `npm run db:setup` to create admin user
- Check credentials in `.env.local`
- Verify `NEXTAUTH_SECRET` is set

## Future Enhancements

- [ ] Background job queue for PDF processing (Inngest/BullMQ)
- [ ] Email notifications for failed uploads
- [ ] Employee detail pages with attendance history
- [ ] Advanced analytics and charts
- [ ] Bulk data import/export
- [ ] Retry mechanism for failed scrapes
- [ ] Multi-admin support with roles
- [ ] Audit logging

## License

MIT

## Support

For issues or questions, please open an issue in the GitHub repository.
