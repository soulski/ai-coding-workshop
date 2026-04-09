import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { App } from "../App";

it("renders the app shell", () => {
  render(App());
  expect(screen.getByText(/catalog/i)).toBeInTheDocument();
});
