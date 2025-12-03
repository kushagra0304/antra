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
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 50vw"
        unoptimized
      />
      {/* Link icon in top left corner */}
      <div className="absolute left-2 top-2 z-10 rounded-full bg-black/50 p-1.5 backdrop-blur-sm transition-opacity hover:bg-black/70">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-white"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </div>
      {product.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-sm font-medium text-white line-clamp-1">{product.title}</p>
        </div>
      )}
    </div>
  );
}

