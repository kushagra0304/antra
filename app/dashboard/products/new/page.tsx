import ProductForm from '../../components/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="mt-2 text-gray-600">Create a new product link</p>
      </div>

      <ProductForm />
    </div>
  );
}

