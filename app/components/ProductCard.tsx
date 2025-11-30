'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    // Track view when component is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            hasTrackedView.current = true;
            // Track view
            fetch('/api/analytics/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: product.id, type: 'view' }),
            }).catch(console.error);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [product.id]);

  const handleClick = () => {
    // Track click
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, type: 'click' }),
    }).catch(console.error);

    // Direct redirect to product link
    window.open(product.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className="relative aspect-square w-full cursor-pointer overflow-hidden bg-gray-100 transition-transform hover:scale-105 active:scale-95"
    >
      <Image
        src={product.photo_url.startsWith('db:') ? `/api/images/${product.id}` : product.photo_url}
        alt={product.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
        unoptimized
      />
      {product.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-sm font-medium text-white line-clamp-1">{product.title}</p>
        </div>
      )}
    </div>
  );
}

