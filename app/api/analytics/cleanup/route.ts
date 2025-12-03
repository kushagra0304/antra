import { NextResponse } from 'next/server';
import { cleanupOldIPs } from '@/lib/services/analytics';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
  try {
    // Optional: Protect cleanup endpoint with authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await cleanupOldIPs();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Old IP records cleaned up' 
    });
  } catch (error) {
    console.error('Error cleaning up IPs:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also allow GET for easy cron job setup
export async function GET() {
  try {
    await cleanupOldIPs();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Old IP records cleaned up' 
    });
  } catch (error) {
    console.error('Error cleaning up IPs:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

