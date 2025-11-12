import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeacherCourses from "../pages/TeacherCourses.jsx"; // adjust path if needed

/* ---------- Minimal mocks ---------- */

// API: TeacherCourses calls GET /enrollments
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

describe("Teacher role (smoke)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Optional: store a teacher user (component may filter by teacher id)
    localStorage.setItem(
      "user",
      JSON.stringify({ userId: 201, fullName: "Teacher One", role: "teacher" })
    );
  });

  it("renders Teacher Courses and attempts to fetch data", async () => {
    render(
      <MemoryRouter initialEntries={["/teacher"]}>
        <TeacherCourses />
      </MemoryRouter>
    );

    // Header should be visible
    expect(await screen.findByText(/My Courses/i)).toBeInTheDocument();

    // Verify the GET call was attempted
    await waitFor(() => {
      expect(apiMocks.get).toHaveBeenCalled();
    });
  });
});
