import { sql } from '../db';
import type { Product, ProductCreate, ProductUpdate } from '../types';

export async function getAllProducts(): Promise<Product[]> {
  const products = await sql<Product[]>`
    SELECT id, photo_url, link, title, description, display_order, created_at, updated_at
    FROM products
    ORDER BY display_order ASC, created_at DESC
  `;
  return products;
}

export async function getProductById(id: number): Promise<Product | null> {
  const products = await sql<Product[]>`
    SELECT id, photo_url, link, title, description, display_order, created_at, updated_at
    FROM products WHERE id = ${id}
  `;
  return products[0] || null;
}

export async function getProductImage(id: number): Promise<{ data: Buffer; mimeType: string } | null> {
  const result = await sql<{ photo_data: Buffer; photo_url: string }[]>`
    SELECT photo_data, photo_url FROM products WHERE id = ${id}
  `;
  
  if (!result[0] || !result[0].photo_data) {
    return null;
  }

  // Determine MIME type from image buffer header
  const buffer = result[0].photo_data;
  let mimeType = 'image/jpeg'; // default
  
  // Check magic bytes for image type
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    mimeType = 'image/png';
  } else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    mimeType = 'image/jpeg';
  } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    mimeType = 'image/gif';
  } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    mimeType = 'image/webp';
  }

  return {
    data: buffer,
    mimeType,
  };
}

export async function createProduct(data: ProductCreate & { photo_data?: Buffer }): Promise<Product> {
  // Get the max display_order to place new product at the end
  const maxOrderResult = await sql<{ max: number | null }[]>`
    SELECT MAX(display_order) as max FROM products
  `;
  const maxOrder = maxOrderResult[0]?.max ?? -1;
  const displayOrder = data.display_order ?? maxOrder + 1;

  // If photo_url starts with "db:", it means we have photo_data to store
  const photoUrl = data.photo_url.startsWith('db:') ? `db:${Date.now()}` : data.photo_url;
  const photoData = data.photo_data || null;

  const products = await sql<Product[]>`
    INSERT INTO products (photo_url, photo_data, link, title, description, display_order)
    VALUES (${photoUrl}, ${photoData}, ${data.link}, ${data.title}, ${data.description || null}, ${displayOrder})
    RETURNING id, photo_url, link, title, description, display_order, created_at, updated_at
  `;
  return products[0];
}

export async function updateProduct(id: number, data: ProductUpdate & { photo_data?: Buffer }): Promise<Product | null> {
  if (Object.keys(data).length === 0) {
    return getProductById(id);
  }

  const updates: any[] = [];
  
  if (data.photo_url !== undefined) {
    const photoUrl = data.photo_url.startsWith('db:') ? `db:${Date.now()}` : data.photo_url;
    updates.push(sql`photo_url = ${photoUrl}`);
    
    // If we have photo_data, update it too
    if (data.photo_data) {
      updates.push(sql`photo_data = ${data.photo_data}`);
    } else if (data.photo_url && !data.photo_url.startsWith('db:')) {
      // If it's an external URL, clear photo_data
      updates.push(sql`photo_data = NULL`);
    }
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
    RETURNING id, photo_url, link, title, description, display_order, created_at, updated_at
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

