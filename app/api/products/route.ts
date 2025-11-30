import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/lib/services/products';
import type { ProductCreate } from '@/lib/types';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: ProductCreate = await request.json();
    
    // Validate required fields
    if (!body.photo_url || !body.link || !body.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: photo_url, link, title' },
        { status: 400 }
      );
    }

    const product = await createProduct(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

