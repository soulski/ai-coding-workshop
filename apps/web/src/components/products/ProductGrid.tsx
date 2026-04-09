import type { Product } from "../../types/product";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  onQuickPreview: (productId: number) => void;
};

export function ProductGrid({ products, onQuickPreview }: ProductGridProps) {
  return (
    <section className="product-grid" aria-label="Products">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onQuickPreview={onQuickPreview} />
      ))}
    </section>
  );
}
