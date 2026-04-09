import type { Product, ProductFilters } from "../types/product";

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.minPrice) {
    params.set("minPrice", filters.minPrice);
  }
  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }

  const response = await fetch(params.toString() ? `/api/products?${params.toString()}` : "/api/products");
  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  return response.json() as Promise<Product[]>;
}

export async function fetchProductById(id: number): Promise<Product> {
  const response = await fetch(`/api/products/${id}`);
  if (!response.ok) {
    throw new Error("Failed to load product");
  }

  return response.json() as Promise<Product>;
}
