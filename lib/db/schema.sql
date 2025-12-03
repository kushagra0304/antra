-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  photo_url TEXT NOT NULL,
  link TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
-- Note: No foreign key constraint on product_id to allow analytics to persist
-- forever even when products are deleted (orphaned product_id references)
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  click_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on display_order for efficient sorting
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

-- Create index on product_id for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON analytics(product_id);

-- Create unique constraint to ensure one analytics record per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_unique_product ON analytics(product_id);

-- Analytics IPs table
-- Note: No foreign key constraint on product_id to allow analytics_ips to persist
-- forever even when products are deleted (orphaned product_id references)
-- This table tracks individual IP actions (views/clicks) for analytics

