export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
};

export type ProductFilters = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
};
