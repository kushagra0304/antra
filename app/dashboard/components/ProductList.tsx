'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products: initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isReordering, setIsReordering] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newProducts = [...products];
    [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];

    setProducts(newProducts);
    setIsReordering(true);

    try {
      const productIds = newProducts.map((p) => p.id);
      await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });
    } catch (error) {
      console.error('Error reordering products:', error);
      alert('Failed to reorder products');
      setProducts(initialProducts);
    } finally {
      setIsReordering(false);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === products.length - 1) return;

    const newProducts = [...products];
    [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];

    setProducts(newProducts);
    setIsReordering(true);

    try {
      const productIds = newProducts.map((p) => p.id);
      await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
      });
    } catch (error) {
      console.error('Error reordering products:', error);
      alert('Failed to reorder products');
      setProducts(initialProducts);
    } finally {
      setIsReordering(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500">No products yet. Add your first product to get started.</p>
        <Link
          href="/dashboard/products/new"
          className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add Product
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Order
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.map((product, index) => (
              <tr key={product.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                      <Image
                        src={product.photo_url.startsWith('db:') ? `/api/images/${product.id}` : product.photo_url}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500">{product.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {product.link.length > 50 ? `${product.link.substring(0, 50)}...` : product.link}
                  </a>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || isReordering}
                      className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <span className="text-sm text-gray-500">{index + 1}</span>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === products.length - 1 || isReordering}
                      className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

