import { NextResponse } from 'next/server';
import { incrementViewCount, incrementClickCount } from '@/lib/services/analytics';

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

    if (type === 'view') {
      await incrementViewCount(productId);
    } else if (type === 'click') {
      await incrementClickCount(productId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "view" or "click"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

