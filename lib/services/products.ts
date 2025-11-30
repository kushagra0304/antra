import { sql } from '../db';
import type { Product, ProductCreate, ProductUpdate } from '../types';

export async function getAllProducts(): Promise<Product[]> {
  const products = await sql<Product[]>`
    SELECT * FROM products
    ORDER BY display_order ASC, created_at DESC
  `;
  return products;
}

export async function getProductById(id: number): Promise<Product | null> {
  const products = await sql<Product[]>`
    SELECT * FROM products WHERE id = ${id}
  `;
  return products[0] || null;
}

export async function createProduct(data: ProductCreate): Promise<Product> {
  // Get the max display_order to place new product at the end
  const maxOrderResult = await sql<{ max: number | null }[]>`
    SELECT MAX(display_order) as max FROM products
  `;
  const maxOrder = maxOrderResult[0]?.max ?? -1;
  const displayOrder = data.display_order ?? maxOrder + 1;

  const products = await sql<Product[]>`
    INSERT INTO products (photo_url, link, title, description, display_order)
    VALUES (${data.photo_url}, ${data.link}, ${data.title}, ${data.description || null}, ${displayOrder})
    RETURNING *
  `;
  return products[0];
}

export async function updateProduct(id: number, data: ProductUpdate): Promise<Product | null> {
  if (Object.keys(data).length === 0) {
    return getProductById(id);
  }

  const updates: any[] = [];
  
  if (data.photo_url !== undefined) {
    updates.push(sql`photo_url = ${data.photo_url}`);
  }
  if (data.link !== undefined) {
    updates.push(sql`link = ${data.link}`);
  }
  if (data.title !== undefined) {
    updates.push(sql`title = ${data.title}`);
  }
  if (data.description !== undefined) {
    updates.push(sql`description = ${data.description}`);
  }
  if (data.display_order !== undefined) {
    updates.push(sql`display_order = ${data.display_order}`);
  }

  updates.push(sql`updated_at = NOW()`);

  const products = await sql<Product[]>`
    UPDATE products
    SET ${sql.join(updates, sql`, `)}
    WHERE id = ${id}
    RETURNING *
  `;
  return products[0] || null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM products WHERE id = ${id}
  `;
  return true;
}

export async function reorderProducts(productIds: number[]): Promise<Product[]> {
  // Update display_order for each product based on its position in the array
  const updates = productIds.map((id, index) => {
    return sql`
      UPDATE products
      SET display_order = ${index}, updated_at = NOW()
      WHERE id = ${id}
    `;
  });

  await Promise.all(updates);

  return getAllProducts();
}

