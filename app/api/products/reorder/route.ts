import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { reorderProducts } from '@/lib/services/products';
import type { ReorderRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: ReorderRequest = await request.json();
    
    if (!body.productIds || !Array.isArray(body.productIds) || body.productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid productIds array' },
        { status: 400 }
      );
    }

    const products = await reorderProducts(body.productIds);
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error reordering products:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

