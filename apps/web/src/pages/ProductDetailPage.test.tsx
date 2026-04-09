import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProductDetailPage } from "./ProductDetailPage";

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
};

const productDetail: Product = {
  id: 1,
  name: "Wireless Bluetooth Headphones",
  price: 79.99,
  imageUrl: "https://example.com/headphones.png",
  description: "High-quality wireless headphones with noise cancellation",
  category: "Electronics",
};

function mockJsonResponse(data: Product): Response {
  return {
    ok: true,
    json: async () => data,
  } as Response;
}

describe("ProductDetailPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and displays product details by route id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse(productDetail));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/products/1"]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: productDetail.name })).toBeInTheDocument();
    expect(await screen.findByText(productDetail.description)).toBeInTheDocument();
  });
});
