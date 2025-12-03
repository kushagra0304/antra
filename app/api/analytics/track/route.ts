import { NextResponse } from 'next/server';
import { incrementViewCount, incrementClickCount } from '@/lib/services/analytics';
import { getClientIP } from '@/lib/utils/ip';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, type } = body;

    if (!productId || typeof productId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid productId' },
        { status: 400 }
      );
    }

    // Extract IP address from request
    const ipAddress = getClientIP(request);
    
    if (ipAddress === 'unknown') {
      // If we can't get IP, still allow tracking but log a warning
      console.warn('Could not extract IP address from request');
    }

    let incremented = false;

    if (type === 'view') {
      incremented = await incrementViewCount(productId, ipAddress);
    } else if (type === 'click') {
      incremented = await incrementClickCount(productId, ipAddress);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "view" or "click"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      incremented,
      message: incremented ? 'Analytics updated' : 'Already tracked for this IP'
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

