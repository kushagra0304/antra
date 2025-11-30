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

    const body: ProductCreate & { photo_data?: string; mime_type?: string } = await request.json();
    
    // Validate required fields
    if ((!body.photo_url && !body.photo_data) || !body.link || !body.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: photo_url or photo_data, link, title' },
        { status: 400 }
      );
    }

    // Convert base64 photo_data to Buffer if provided
    let photoData: Buffer | undefined;
    let photoUrl = body.photo_url;
    
    if (body.photo_data) {
      // Remove data URL prefix if present
      const base64Data = body.photo_data.replace(/^data:image\/\w+;base64,/, '');
      photoData = Buffer.from(base64Data, 'base64');
      photoUrl = `db:${Date.now()}`;
    }

    const product = await createProduct({
      ...body,
      photo_url: photoUrl,
      photo_data: photoData,
    });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

