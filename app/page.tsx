import ProductGrid from './components/ProductGrid';
import { getAllProducts } from '@/lib/services/products';

export default async function Home() {
  const products = await getAllProducts();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <ProductGrid products={products} />
      </div>
    </main>
  );
}
