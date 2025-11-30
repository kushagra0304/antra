import { getTotalStats } from '@/lib/services/analytics';
import { getAllProducts } from '@/lib/services/products';
import Link from 'next/link';

export default async function DashboardPage() {
  const [stats, products] = await Promise.all([
    getTotalStats(),
    getAllProducts(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Manage your products and track performance</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">Total Products</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">Total Views</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalViews}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">Total Clicks</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalClicks}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-gray-500">Click Rate</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalViews > 0
              ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1)
              : '0.0'}
            %
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/products/new"
            className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <div className="text-2xl font-bold text-gray-400">+</div>
            <div className="mt-2 text-sm font-medium text-gray-700">Add New Product</div>
          </Link>
          <Link
            href="/dashboard/products"
            className="rounded-lg border border-gray-300 bg-white p-6 text-center transition-colors hover:bg-gray-50"
          >
            <div className="text-sm font-medium text-gray-700">Manage Products</div>
            <div className="mt-1 text-xs text-gray-500">{products.length} products</div>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="rounded-lg border border-gray-300 bg-white p-6 text-center transition-colors hover:bg-gray-50"
          >
            <div className="text-sm font-medium text-gray-700">View Analytics</div>
            <div className="mt-1 text-xs text-gray-500">Performance insights</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

