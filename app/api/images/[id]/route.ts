import { NextResponse } from 'next/server';
import { getProductImage } from '@/lib/services/products';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    
    if (isNaN(productId)) {
      return new NextResponse('Invalid product ID', { status: 400 });
    }

    const imageData = await getProductImage(productId);
    
    if (!imageData) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(imageData.data, {
      headers: {
        'Content-Type': imageData.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

