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
      className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <Image
        src={product.photo_url}
        alt={product.title}
        fill
        className="object-cover transition-transform group-hover:scale-110"
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
        unoptimized
      />
      
      {/* Link Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20 sm:group-hover:bg-black/20">
        <div className="rounded-full bg-white/90 p-3 opacity-100 shadow-lg transition-all sm:opacity-0 sm:group-hover:opacity-100 group-active:scale-90">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6 text-gray-900"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
            />
          </svg>
        </div>
      </div>

      {/* Title Overlay */}
      {product.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3">
          <p className="text-sm font-semibold text-white line-clamp-2">{product.title}</p>
        </div>
      )}
    </div>
  );
}

