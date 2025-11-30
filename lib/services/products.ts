import { sql } from '../db';
import type { Product, ProductCreate, ProductUpdate } from '../types';

export async function getAllProducts(): Promise<Product[]> {
  const products = (await sql`
    SELECT * FROM products
    ORDER BY display_order ASC, created_at DESC
  `) as Product[];
  return products;
}

export async function getProductById(id: number): Promise<Product | null> {
  const products = (await sql`
    SELECT * FROM products WHERE id = ${id}
  `) as Product[];
  return products[0] || null;
}

export async function createProduct(data: ProductCreate): Promise<Product> {
  // Get the max display_order to place new product at the end
  const maxOrderResult = (await sql`
    SELECT MAX(display_order) as max FROM products
  `) as { max: number | null }[];
  const maxOrder = maxOrderResult[0]?.max ?? -1;
  const displayOrder = data.display_order ?? maxOrder + 1;

  const products = (await sql`
    INSERT INTO products (photo_url, link, title, description, display_order)
    VALUES (${data.photo_url}, ${data.link}, ${data.title}, ${data.description || null}, ${displayOrder})
    RETURNING *
  `) as Product[];
  return products[0];
}

export async function updateProduct(id: number, data: ProductUpdate): Promise<Product | null> {
  if (Object.keys(data).length === 0) {
    return getProductById(id);
  }

  // Get current product to merge with updates
  const current = await getProductById(id);
  if (!current) {
    return null;
  }

  // Merge current values with updates
  const updatedData = {
    photo_url: data.photo_url ?? current.photo_url,
    link: data.link ?? current.link,
    title: data.title ?? current.title,
    description: data.description !== undefined ? data.description : current.description,
    display_order: data.display_order ?? current.display_order,
  };

  // Single UPDATE query with all fields
  const products = (await sql`
    UPDATE products
    SET 
      photo_url = ${updatedData.photo_url},
      link = ${updatedData.link},
      title = ${updatedData.title},
      description = ${updatedData.description},
      display_order = ${updatedData.display_order},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as Product[];
  
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

