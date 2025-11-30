export interface Product {
  id: number;
  photo_url: string;
  link: string;
  title: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  photo_url: string;
  link: string;
  title: string;
  description?: string;
  display_order?: number;
}

export interface ProductUpdate {
  photo_url?: string;
  link?: string;
  title?: string;
  description?: string;
  display_order?: number;
}

export interface Analytics {
  id: number;
  product_id: number;
  click_count: number;
  view_count: number;
  last_clicked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsWithProduct extends Analytics {
  product: Product;
}

export interface ReorderRequest {
  productIds: number[];
}

