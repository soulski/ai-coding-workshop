import type { ChangeEvent } from "react";

import type { ProductFilters as ProductFiltersState } from "../../types/product";

type ProductFiltersProps = {
  filters: ProductFiltersState;
  categories: string[];
  onChange: (nextFilters: ProductFiltersState) => void;
};

export function ProductFilters({ filters, categories, onChange }: ProductFiltersProps) {
  const onFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = event.target.name as keyof ProductFiltersState;

    onChange({
      ...filters,
      [fieldName]: event.target.value,
    });
  };

  return (
    <section className="filter-panel" aria-label="Product filters">
      <div className="field-group">
        <label htmlFor="category">Category</label>
        <select id="category" name="category" value={filters.category ?? ""} onChange={onFieldChange}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label htmlFor="minPrice">Min price</label>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          min="0"
          step="0.01"
          value={filters.minPrice ?? ""}
          onChange={onFieldChange}
          placeholder="0"
        />
      </div>

      <div className="field-group">
        <label htmlFor="maxPrice">Max price</label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min="0"
          step="0.01"
          value={filters.maxPrice ?? ""}
          onChange={onFieldChange}
          placeholder="1000"
        />
      </div>
    </section>
  );
}
