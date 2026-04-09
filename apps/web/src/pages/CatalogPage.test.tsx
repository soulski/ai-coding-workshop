import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CatalogPage } from "./CatalogPage";

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
};

const productList: Product[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    imageUrl: "https://example.com/headphones.png",
    description: "High-quality wireless headphones",
    category: "Electronics",
  },
];

const filteredList: Product[] = [...productList];

const productDetail: Product = {
  id: 1,
  name: "Wireless Bluetooth Headphones",
  price: 79.99,
  imageUrl: "https://example.com/headphones.png",
  description: "High-quality wireless headphones with noise cancellation",
  category: "Electronics",
};

function mockJsonResponse(data: Product[] | Product): Response {
  return {
    ok: true,
    json: async () => data,
  } as Response;
}

describe("CatalogPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests filtered products from the API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJsonResponse(productList))
      .mockResolvedValueOnce(mockJsonResponse(filteredList));

    vi.stubGlobal("fetch", fetchMock);
    render(<CatalogPage />);

    await screen.findByText("Wireless Bluetooth Headphones");
    await userEvent.selectOptions(screen.getByLabelText(/category/i), "Electronics");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining("/api/products?category=Electronics"));
    });
  });

  it("opens quick preview and shows detail data", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJsonResponse(productList))
      .mockResolvedValueOnce(mockJsonResponse(productDetail));

    vi.stubGlobal("fetch", fetchMock);
    render(<CatalogPage />);

    await userEvent.click(await screen.findByRole("button", { name: /quick preview/i }));
    expect(await screen.findByText(productDetail.description)).toBeInTheDocument();
  });
});
