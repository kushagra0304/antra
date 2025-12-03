import { NextResponse } from 'next/server';
import { incrementViewCount, incrementClickCount } from '@/lib/services/analytics';
import { getClientIP } from '@/lib/utils/ip';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, type } = body;

    console.log('[IP-CACHE-DEBUG] Analytics track request received:', { productId, type });

    if (!productId || typeof productId !== 'number') {
      console.error('[IP-CACHE-DEBUG] Invalid productId:', productId);
      return NextResponse.json(
        { success: false, error: 'Invalid productId' },
        { status: 400 }
      );
    }

    // Extract IP address from request
    const ipAddress = getClientIP(request);
    console.log('[IP-CACHE-DEBUG] Extracted IP for tracking:', { ipAddress, productId, type });
    
    if (ipAddress === 'unknown') {
      // If we can't get IP, still allow tracking but log a warning
      console.warn('[IP-CACHE-DEBUG] Could not extract IP address from request, using "unknown"');
    }

    let incremented = false;

    if (type === 'view') {
      console.log('[IP-CACHE-DEBUG] Processing view tracking:', { productId, ipAddress });
      incremented = await incrementViewCount(productId, ipAddress);
      console.log('[IP-CACHE-DEBUG] View tracking result:', { productId, ipAddress, incremented });
    } else if (type === 'click') {
      console.log('[IP-CACHE-DEBUG] Processing click tracking:', { productId, ipAddress });
      incremented = await incrementClickCount(productId, ipAddress);
      console.log('[IP-CACHE-DEBUG] Click tracking result:', { productId, ipAddress, incremented });
    } else {
      console.error('[IP-CACHE-DEBUG] Invalid type:', type);
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "view" or "click"' },
        { status: 400 }
      );
    }

    const response = { 
      success: true, 
      incremented,
      message: incremented ? 'Analytics updated' : 'Already tracked for this IP',
      debug: { ipAddress, productId, type }
    };
    
    console.log('[IP-CACHE-DEBUG] Analytics track response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[IP-CACHE-DEBUG] Error tracking analytics:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

