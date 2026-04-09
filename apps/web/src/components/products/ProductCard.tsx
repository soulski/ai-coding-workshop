import type { Product } from "../../types/product";

type ProductCardProps = {
  product: Product;
  onQuickPreview: (productId: number) => void;
};

export function ProductCard({ product, onQuickPreview }: ProductCardProps) {
  return (
    <article className="product-card">
      <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
      <div className="product-card-content">
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-actions">
          <button type="button" className="button-secondary" onClick={() => onQuickPreview(product.id)}>
            Quick preview
          </button>
          <a className="button-primary" href={`/products/${product.id}`}>
            View details
          </a>
        </div>
      </div>
    </article>
  );
}
