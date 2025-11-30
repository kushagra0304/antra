import { getAllAnalytics, getTotalStats } from '@/lib/services/analytics';
import Image from 'next/image';

export default async function AnalyticsPage() {
  const [analytics, stats] = await Promise.all([
    getAllAnalytics(),
    getTotalStats(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">Track your product performance</p>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-3">
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

      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Performance</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {analytics.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No analytics data available yet.
            </div>
          ) : (
            analytics.map((item) => (
              <div key={item.id} className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={item.product.photo_url.startsWith('db:') ? `/api/images/${item.product.id}` : item.product.photo_url}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                    <p className="text-sm text-gray-500">{item.product.link}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{item.view_count}</div>
                      <div className="text-gray-500">Views</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.click_count}</div>
                      <div className="text-gray-500">Clicks</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.view_count > 0
                          ? ((item.click_count / item.view_count) * 100).toFixed(1)
                          : '0.0'}
                        %
                      </div>
                      <div className="text-gray-500">Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

