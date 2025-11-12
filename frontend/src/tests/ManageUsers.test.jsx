// src/tests/ManageUsers.test.jsx
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/* ----- minimal hoisted mocks ----- */
const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("../services/http", () => ({
  __esModule: true,
  default: { get: api.get },
}));

vi.mock("react-hot-toast", () => {
  const t = { success: vi.fn(), error: vi.fn() };
  return { __esModule: true, default: t, success: t.success, error: t.error };
});

/* ----- under test (adjust path if needed) ----- */
import ManageUsers from "../pages/ManageUsers.jsx";

/* ----- test ----- */
describe("ManageUsers (simple)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads users and renders the list after fetch", async () => {
    // return two users on first GET
    api.get.mockResolvedValueOnce({
      data: [
        {
          userId: 1,
          fullName: "Alice Admin",
          email: "alice@lms.edu",
          role: { roleId: 1, roleName: "Admin" },
          createdAt: "2025-11-10T08:00:00Z",
        },
        {
          userId: 2,
          fullName: "Bob Teacher",
          email: "bob@lms.edu",
          role: { roleId: 2, roleName: "Teacher" },
          createdAt: "2025-11-10T09:00:00Z",
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/admin/users"]}>
        <ManageUsers />
      </MemoryRouter>
    );

    // Initially it may show "Loading users..."; we just wait for names to appear.
    expect(await screen.findByText("Alice Admin")).toBeInTheDocument();
    expect(await screen.findByText("Bob Teacher")).toBeInTheDocument();
  });
});
