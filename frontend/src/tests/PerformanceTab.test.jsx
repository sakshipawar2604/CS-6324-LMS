// src/tests/PerformanceTab.test.jsx
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

/* ---------- Minimal, hoisted mocks ---------- */
const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("../services/http", () => ({
  __esModule: true,
  default: { get: api.get },
}));

vi.mock("react-hot-toast", () => {
  const t = { error: vi.fn(), success: vi.fn() };
  return { __esModule: true, default: t, error: t.error, success: t.success };
});

/* ---------- Under test ---------- */
import PerformanceTab from "../components/PerformanceTab.jsx";

/* ---------- Tests ---------- */
describe("PerformanceTab (simple)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("teacher view: shows Student Performance Overview with one student row", async () => {
    api.get.mockResolvedValueOnce({
      data: [{ averagePercentage: 76, userDto: { fullName: "Alice Student" } }],
    });

    render(<PerformanceTab role="teacher" courseId={1} />);

    expect(await screen.findByText(/Student Performance Overview/i)).toBeInTheDocument();
    expect(screen.getByText("Alice Student")).toBeInTheDocument();

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        "/courses/averageGradesOfStudentsInACourse/1"
      )
    );
  });

  it("student view: shows Course Performance and average grade (82/100), with no recs message", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/student/performance/100/1") {
        return Promise.resolve({
          data: {
            avg_grade: 82,
            assignments: [
              { assignment_id: 11, title: "HW1", grade: 80 },
              { assignment_id: 12, title: "HW2", grade: 84 },
            ],
          },
        });
      }
      if (url === "/student/recommendations/100/1") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(<PerformanceTab role="student" courseId={1} studentId={100} />);

    expect(await screen.findByText(/Course Performance/i)).toBeInTheDocument();
    expect(await screen.findByText(/82\/100/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No personalized recommendations at this time\./i)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/student/performance/100/1")
    );
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/student/recommendations/100/1")
    );
  });
});
