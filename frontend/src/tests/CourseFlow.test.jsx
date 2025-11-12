import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/* ===================== HOISTED MOCKS ===================== */

// Return data by URL so call order doesn't matter
const apiMocks = vi.hoisted(() => ({
  get: vi.fn((url) => {
    if (url?.includes("/courses/")) {
      return Promise.resolve({
        data: {
          courseId: 1,
          title: "Algorithms 101",
          description: "Intro to Algorithms",
          createdBy: { fullName: "Prof. Ada" },
        },
      });
    }
    if (url?.includes("/assignments")) return Promise.resolve({ data: [] });
    if (url?.includes("/modules/getModulesByCourseId/")) return Promise.resolve({ data: [] });
    if (url?.includes("/enrollments")) return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  }),
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

// Keep non-essential children lean
vi.mock("../components/SkipToMain", () => ({ __esModule: true, default: () => null }));

/* ===================== UNDER TEST ===================== */
// Adjust path if your structure differs
import CourseDetails from "../pages/CourseDetails.jsx";

/* ===================== TEST ===================== */
describe("Course Details (smoke)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // If your CourseDetails uses user info, provide a minimal user
    localStorage.setItem(
      "user",
      JSON.stringify({ userId: 100, fullName: "Student One", role: "student" })
    );
  });

  it("loads Course Details and shows the course title", async () => {
    render(
      <MemoryRouter initialEntries={["/courses/1"]}>
        <Routes>
          <Route path="/courses/:courseId" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Title from mocked API should appear
    expect(await screen.findByText(/Algorithms 101/i)).toBeInTheDocument();

    // Confirm a fetch happened
    await waitFor(() => expect(apiMocks.get).toHaveBeenCalled());
  });
});
