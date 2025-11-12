import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StudentDashboard from "../pages/StudentDashboard.jsx"; // adjust path if needed

/* ---------- Minimal mocks ---------- */

// API: resolve with empty arrays quickly; component makes multiple GETs
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

// Keep DOM lean
vi.mock("../components/SkipToMain", () => ({ __esModule: true, default: () => null }));

describe("Student role (smoke)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Provide a userId so StudentDashboard proceeds to fetch
    localStorage.setItem(
      "user",
      JSON.stringify({ userId: 101, fullName: "Student One", role: "student" })
    );
  });

  it("renders Student Dashboard and attempts to fetch data", async () => {
    render(
      <MemoryRouter initialEntries={["/student"]}>
        <StudentDashboard />
      </MemoryRouter>
    );

    // Header should appear after loading finishes
    expect(await screen.findByText(/Student Dashboard/i)).toBeInTheDocument();

    // At least one GET requested (/enrollments, /assignments, or /submissions)
    await waitFor(() => {
      expect(apiMocks.get).toHaveBeenCalled();
    });
  });
});
