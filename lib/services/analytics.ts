import { sql } from '../db';
import type { Analytics, AnalyticsWithProduct } from '../types';

export async function getAnalyticsByProductId(productId: number): Promise<Analytics | null> {
  const analytics = await sql<Analytics[]>`
    SELECT * FROM analytics WHERE product_id = ${productId}
  `;
  return analytics[0] || null;
}

export async function getAllAnalytics(): Promise<AnalyticsWithProduct[]> {
  const analytics = await sql<{
    id: number;
    product_id: number;
    click_count: number;
    view_count: number;
    last_clicked_at: string | null;
    created_at: string;
    updated_at: string;
    p_id: number;
    p_photo_url: string;
    p_link: string;
    p_title: string;
    p_description: string | null;
    p_display_order: number;
    p_created_at: string;
    p_updated_at: string;
  }[]>`
    SELECT 
      a.id,
      a.product_id,
      a.click_count,
      a.view_count,
      a.last_clicked_at,
      a.created_at,
      a.updated_at,
      p.id as p_id,
      p.photo_url as p_photo_url,
      p.link as p_link,
      p.title as p_title,
      p.description as p_description,
      p.display_order as p_display_order,
      p.created_at as p_created_at,
      p.updated_at as p_updated_at
    FROM analytics a
    JOIN products p ON a.product_id = p.id
    ORDER BY a.click_count DESC, a.view_count DESC
  `;
  
  // Transform the result to match the AnalyticsWithProduct type
  return analytics.map((item) => ({
    id: item.id,
    product_id: item.product_id,
    click_count: item.click_count,
    view_count: item.view_count,
    last_clicked_at: item.last_clicked_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
    product: {
      id: item.p_id,
      photo_url: item.p_photo_url,
      link: item.p_link,
      title: item.p_title,
      description: item.p_description,
      display_order: item.p_display_order,
      created_at: item.p_created_at,
      updated_at: item.p_updated_at,
    },
  })) as AnalyticsWithProduct[];
}

export async function incrementViewCount(productId: number): Promise<void> {
  await sql`
    INSERT INTO analytics (product_id, view_count)
    VALUES (${productId}, 1)
    ON CONFLICT (product_id)
    DO UPDATE SET
      view_count = analytics.view_count + 1,
      updated_at = NOW()
  `;
}

export async function incrementClickCount(productId: number): Promise<void> {
  await sql`
    INSERT INTO analytics (product_id, click_count, last_clicked_at)
    VALUES (${productId}, 1, NOW())
    ON CONFLICT (product_id)
    DO UPDATE SET
      click_count = analytics.click_count + 1,
      last_clicked_at = NOW(),
      updated_at = NOW()
  `;
}

export async function getTotalStats(): Promise<{
  totalViews: number;
  totalClicks: number;
  totalProducts: number;
}> {
  const stats = await sql<{
    total_views: number;
    total_clicks: number;
    total_products: number;
  }[]>`
    SELECT 
      COALESCE(SUM(view_count), 0) as total_views,
      COALESCE(SUM(click_count), 0) as total_clicks,
      COUNT(DISTINCT product_id) as total_products
    FROM analytics
  `;
  return {
    totalViews: stats[0]?.total_views ?? 0,
    totalClicks: stats[0]?.total_clicks ?? 0,
    totalProducts: stats[0]?.total_products ?? 0,
  };
}

