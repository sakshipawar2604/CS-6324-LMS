import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";

/* ------------ Minimal, stable mocks ------------ */

// HTTP: return empty lists quickly for all endpoints
const apiMocks = vi.hoisted(() => ({
  get: vi.fn(() => Promise.resolve({ data: [] })),
}));
vi.mock("../services/http", () => ({
  __esModule: true,
  default: { get: apiMocks.get },
}));

// Silence toasts
vi.mock("react-hot-toast", () => {
  const toast = { error: vi.fn(), success: vi.fn() };
  return { __esModule: true, default: toast, error: toast.error, success: toast.success };
});

// Keep DOM lean; also gives us a stable selector to assert on
vi.mock("../components/AdminSidebar", () => ({
  __esModule: true,
  default: () => <aside data-testid="admin-sidebar" />,
}));
vi.mock("../components/SkipToMain", () => ({
  __esModule: true,
  default: () => null,
}));

/* ------------ Helper render ------------ */
const renderApp = () =>
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

/* ------------ Single simple test ------------ */
describe("AdminLayout + AdminDashboard (smoke)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Optional: put a user for any greeting logic (won't assert on it)
    localStorage.setItem("user", JSON.stringify({
      fullName: "Admin One",
      email: "admin@example.com",
      role: "admin",
    }));
  });

  it("renders admin area without crashing (sidebar present, data fetch attempted)", async () => {
    renderApp();

    // Sidebar from AdminLayout should be present
    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();

    // Dashboard should attempt to fetch data (any endpoint)
    await waitFor(() => expect(apiMocks.get).toHaveBeenCalled());
  });
});
