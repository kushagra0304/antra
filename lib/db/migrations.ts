import { sql } from '../db';

export async function runMigrations() {
  try {
    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        photo_url TEXT NOT NULL,
        photo_data BYTEA,
        link TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Add photo_data column if it doesn't exist (for existing databases)
    // Use a simpler approach that works better with Neon
    try {
      await sql`
        ALTER TABLE products ADD COLUMN photo_data BYTEA;
      `;
    } catch (error) {
      // Column already exists, which is fine
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('already exists') && !errorMessage.includes('duplicate')) {
        throw error;
      }
    }

    // Create analytics table
    await sql`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        click_count INTEGER NOT NULL DEFAULT 0,
        view_count INTEGER NOT NULL DEFAULT 0,
        last_clicked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON analytics(product_id)
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_unique_product ON analytics(product_id)
    `;

    // Create analytics_ips table for IP-based tracking
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_ips (
        id SERIAL PRIMARY KEY,
        ip_address TEXT NOT NULL,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL CHECK (action_type IN ('view', 'click')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes for efficient lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_analytics_ips_lookup 
      ON analytics_ips(ip_address, product_id, action_type, created_at)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_analytics_ips_created_at 
      ON analytics_ips(created_at)
    `;

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}
