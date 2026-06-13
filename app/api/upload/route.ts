import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pdfUploads } from '@/lib/db/schema';
import { processPdfWithE2B } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Create upload record
    const [upload] = await db
      .insert(pdfUploads)
      .values({
        filename: file.name,
        originalName: file.name,
        status: 'pending',
        uploadedBy: session.user.email || 'unknown',
      })
      .returning();

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process in background (you might want to use a queue for production)
    processPdfWithE2B(buffer, file.name, upload.id).catch((error) => {
      console.error('Background processing error:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'PDF uploaded successfully, processing started',
      uploadId: upload.id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload PDF' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const uploads = await db.query.pdfUploads.findMany({
      orderBy: (pdfUploads, { desc }) => [desc(pdfUploads.createdAt)],
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      data: uploads,
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch uploads' },
      { status: 500 }
    );
  }
}
