import { useEffect, useMemo, useState } from "react";

import { fetchProductById, fetchProducts } from "../api/products";
import { ProductFilters } from "../components/products/ProductFilters";
import { ProductGrid } from "../components/products/ProductGrid";
import { ProductQuickPreviewModal } from "../components/products/ProductQuickPreviewModal";
import type { Product, ProductFilters as ProductFiltersState } from "../types/product";

export function CatalogPage() {
  const [filters, setFilters] = useState<ProductFiltersState>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadProducts() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetchProducts(filters);
        if (isActive) {
          setProducts(response);
        }
      } catch {
        if (isActive) {
          setErrorMessage("We could not load products right now.");
          setProducts([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isActive = false;
    };
  }, [filters]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map((product) => product.category));
    return [...uniqueCategories].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const handleQuickPreview = async (productId: number) => {
    setIsPreviewLoading(true);
    setErrorMessage(null);

    try {
      const detail = await fetchProductById(productId);
      setSelectedProduct(detail);
    } catch {
      setErrorMessage("We could not open quick preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <p className="eyebrow">Featured catalog</p>
        <h1>Find premium everyday picks</h1>
        <p>Explore products by category and price, then open a quick preview before visiting the full detail page.</p>
      </header>

      <ProductFilters filters={filters} categories={categories} onChange={setFilters} onClear={handleClearFilters} />

      {isLoading ? <p className="status">Loading products...</p> : null}
      {!isLoading && errorMessage ? <p className="status error">{errorMessage}</p> : null}
      {!isLoading && !errorMessage && products.length === 0 ? (
        <div className="status">
          <p>No products match these filters.</p>
          <button type="button" className="button-secondary" onClick={handleClearFilters}>
            Reset filters
          </button>
        </div>
      ) : null}
      {!isLoading && !errorMessage && products.length > 0 ? (
        <ProductGrid products={products} onQuickPreview={handleQuickPreview} />
      ) : null}

      {isPreviewLoading ? <p className="status">Loading quick preview...</p> : null}
      {selectedProduct ? <ProductQuickPreviewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} /> : null}
    </main>
  );
}
