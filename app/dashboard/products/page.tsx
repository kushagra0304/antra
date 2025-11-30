import { getAllProducts } from '@/lib/services/products';
import Link from 'next/link';
import ProductList from '../components/ProductList';

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">Manage your product links and photos</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add Product
        </Link>
      </div>

      <ProductList products={products} />
    </div>
  );
}

