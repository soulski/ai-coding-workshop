import type { Product } from "../../types/product";

type ProductQuickPreviewModalProps = {
  product: Product;
  onClose: () => void;
};

export function ProductQuickPreviewModal({ product, onClose }: ProductQuickPreviewModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Quick preview for ${product.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="icon-close" aria-label="Close quick preview" onClick={onClose}>
          x
        </button>
        <img src={product.imageUrl} alt={product.name} className="modal-image" />
        <p className="product-category">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
      </div>
    </div>
  );
}
