import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getAllAnalytics, getTotalStats } from '@/lib/services/analytics';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [analytics, stats] = await Promise.all([
      getAllAnalytics(),
      getTotalStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

