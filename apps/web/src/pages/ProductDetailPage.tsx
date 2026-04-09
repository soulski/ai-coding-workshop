import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchProductById } from "../api/products";
import type { Product } from "../types/product";

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setErrorMessage("Product not found.");
      setIsLoading(false);
      return;
    }

    let isActive = true;

    async function loadProduct() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetchProductById(productId);
        if (isActive) {
          setProduct(response);
        }
      } catch {
        if (isActive) {
          setErrorMessage("Product not found.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main className="detail-page">
        <p className="status">Loading product details...</p>
      </main>
    );
  }

  if (errorMessage || !product) {
    return (
      <main className="detail-page">
        <p className="status error">{errorMessage ?? "Product not found."}</p>
        <Link className="button-primary" to="/">
          Back to catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <div className="detail-layout">
        <img src={product.imageUrl} alt={product.name} className="detail-image" />
        <section className="detail-content">
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          <Link className="button-primary" to="/">
            Back to catalog
          </Link>
        </section>
      </div>
    </main>
  );
}
