'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on root page and dashboard routes
  // Root page is public and doesn't need header
  if (pathname === '/' || pathname?.startsWith('/dashboard')) {
    return null;
  }

  return null;
}

