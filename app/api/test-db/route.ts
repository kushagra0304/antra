import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Example query - test the connection
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Database connection successful!',
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

