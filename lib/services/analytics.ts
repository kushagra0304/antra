import { sql } from '../db';
import type { Analytics, AnalyticsWithProduct } from '../types';

export async function getAnalyticsByProductId(productId: number): Promise<Analytics | null> {
  const analytics = await sql`
    SELECT * FROM analytics WHERE product_id = ${productId}
  ` as Analytics[];
  return analytics[0] || null;
}

export async function getAllAnalytics(): Promise<AnalyticsWithProduct[]> {
  const analytics = await sql`
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
  ` as {
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
  }[];
  
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

/**
 * Check if IP has already performed an action within the last 24 hours
 */
async function hasIPActioned(ipAddress: string, productId: number, actionType: 'view' | 'click'): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(*) as count
    FROM analytics_ips
    WHERE ip_address = ${ipAddress}
      AND product_id = ${productId}
      AND action_type = ${actionType}
      AND created_at > NOW() - INTERVAL '24 hours'
  ` as { count: number }[];
  
  return (result[0]?.count ?? 0) > 0;
}

/**
 * Record IP action in cache
 */
async function recordIPAction(ipAddress: string, productId: number, actionType: 'view' | 'click'): Promise<void> {
  await sql`
    INSERT INTO analytics_ips (ip_address, product_id, action_type)
    VALUES (${ipAddress}, ${productId}, ${actionType})
  `;
}

/**
 * Cleanup IP records older than 24 hours
 */
export async function cleanupOldIPs(): Promise<void> {
  await sql`
    DELETE FROM analytics_ips
    WHERE created_at < NOW() - INTERVAL '24 hours'
  `;
}

export async function incrementViewCount(productId: number, ipAddress: string): Promise<boolean> {
  // Check if this IP has already viewed this product in the last 24 hours
  const hasViewed = await hasIPActioned(ipAddress, productId, 'view');
  
  if (hasViewed) {
    return false; // Already viewed, don't increment
  }
  
  // Record the IP action
  await recordIPAction(ipAddress, productId, 'view');
  
  // Increment the view count
  await sql`
    INSERT INTO analytics (product_id, view_count)
    VALUES (${productId}, 1)
    ON CONFLICT (product_id)
    DO UPDATE SET
      view_count = analytics.view_count + 1,
      updated_at = NOW()
  `;
  
  // Run cleanup periodically (lazy cleanup - every 100th request or so)
  // For now, we'll run it on every request but it's efficient with the index
  // In production, you might want to run this less frequently
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupOldIPs().catch(console.error);
  }
  
  return true; // Successfully incremented
}

export async function incrementClickCount(productId: number, ipAddress: string): Promise<boolean> {
  // Check if this IP has already clicked this product
  const hasClicked = await hasIPActioned(ipAddress, productId, 'click');
  
  if (hasClicked) {
    return false; // Already clicked, don't increment
  }
  
  // Record the IP action
  await recordIPAction(ipAddress, productId, 'click');
  
  // Increment the click count
  await sql`
    INSERT INTO analytics (product_id, click_count, last_clicked_at)
    VALUES (${productId}, 1, NOW())
    ON CONFLICT (product_id)
    DO UPDATE SET
      click_count = analytics.click_count + 1,
      last_clicked_at = NOW(),
      updated_at = NOW()
  `;
  
  // Run cleanup periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupOldIPs().catch(console.error);
  }
  
  return true; // Successfully incremented
}

export async function getTotalStats(): Promise<{
  totalViews: number;
  totalClicks: number;
  totalProducts: number;
}> {
  const stats = await sql`
    SELECT 
      COALESCE(SUM(view_count), 0) as total_views,
      COALESCE(SUM(click_count), 0) as total_clicks,
      COUNT(DISTINCT product_id) as total_products
    FROM analytics
  ` as {
    total_views: number;
    total_clicks: number;
    total_products: number;
  }[];
  return {
    totalViews: stats[0]?.total_views ?? 0,
    totalClicks: stats[0]?.total_clicks ?? 0,
    totalProducts: stats[0]?.total_products ?? 0,
  };
}

