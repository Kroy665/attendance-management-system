# Quick Start Guide

Get your PDF Attendance Management System running in 5 minutes!

## Step 1: Set up Neon Database

1. Go to https://neon.tech and sign up (free tier is fine)
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

## Step 2: Set up E2B

1. Go to https://e2b.dev and sign up
2. Go to dashboard: https://e2b.dev/dashboard
3. Copy your API key

## Step 3: Set up Vercel Blob (Optional - for fallback)

1. Go to https://vercel.com and sign up
2. Create a new project or use existing
3. Go to Storage > Create Database > Blob
4. Copy the `BLOB_READ_WRITE_TOKEN`

## Step 4: Configure Environment

```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local with your favorite editor
nano .env.local
```

Fill in:
```env
DATABASE_URL=postgresql://your-neon-connection-string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
E2B_API_KEY=your-e2b-api-key
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Step 5: Install & Setup Database

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Create admin user
npm run db:setup
```

## Step 6: Run the App

```bash
npm run dev
```

## Step 7: Test It Out!

### Public Site
Visit http://localhost:3000

You should see:
- Empty attendance table (no data yet)
- Statistics dashboard showing zeros
- Filters UI

### Admin Upload
1. Go to http://localhost:3000/admin/login
2. Login with your admin credentials (from .env.local)
3. Upload a PDF from `../pdf-scraper` folder (e.g., `D.EL.ED merged.pdf`)
4. Watch it process!
5. Go back to home page to see the data

## Troubleshooting

### "Database connection failed"
- Check your DATABASE_URL in .env.local
- Make sure Neon database is active

### "E2B API error"
- Verify E2B_API_KEY is correct
- Check E2B dashboard for quota
- PDF will still be saved to Blob storage as fallback

### "Admin login not working"
- Run `npm run db:setup` again
- Check NEXTAUTH_SECRET is set

## Next Steps

1. Upload more PDFs to test the system
2. Try filtering and searching on the public page
3. Export data to CSV
4. Customize the UI/styling

## Production Deployment

When ready to deploy:

1. Push code to GitHub
2. Connect to Vercel
3. Add all environment variables
4. Deploy!
5. Run `npm run db:setup` using Vercel CLI for production admin

Enjoy your PDF scraping system!
