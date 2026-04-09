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
const emptyList: Product[] = [];

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
    expect(await screen.findByRole("link", { name: /view details/i })).toHaveAttribute("href", "/products/1");
  });

  it("clears filters from filter controls", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJsonResponse(productList))
      .mockResolvedValueOnce(mockJsonResponse(filteredList))
      .mockResolvedValueOnce(mockJsonResponse(productList));

    vi.stubGlobal("fetch", fetchMock);
    render(<CatalogPage />);

    await screen.findByText("Wireless Bluetooth Headphones");
    const categorySelect = screen.getByLabelText(/category/i);

    await userEvent.selectOptions(categorySelect, "Electronics");
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining("/api/products?category=Electronics"));
    });

    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith("/api/products");
    });
    expect(categorySelect).toHaveValue("");
  });

  it("shows empty state reset action and reloads unfiltered products", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockJsonResponse(productList))
      .mockResolvedValueOnce(mockJsonResponse(emptyList))
      .mockResolvedValueOnce(mockJsonResponse(productList));

    vi.stubGlobal("fetch", fetchMock);
    render(<CatalogPage />);

    await screen.findByText("Wireless Bluetooth Headphones");
    await userEvent.selectOptions(screen.getByLabelText(/category/i), "Electronics");
    expect(await screen.findByText(/no products match these filters/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /reset filters/i }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith("/api/products");
    });
  });
});
