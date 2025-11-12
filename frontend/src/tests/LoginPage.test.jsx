import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/LoginPage.jsx";

/** --------- HOISTED Mocks (Vitest requires this) --------- */

// react-router navigate
const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => routerMocks.navigate,
  };
});

// react-hot-toast
const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("react-hot-toast", () => {
  const toast = { success: toastMocks.success, error: toastMocks.error };
  return {
    __esModule: true,
    default: toast,
    success: toastMocks.success,
    error: toastMocks.error,
  };
});

// API service
const apiMocks = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
}));
vi.mock("../services/http", () => ({
  __esModule: true,
  default: {
    post: apiMocks.post,
    get: apiMocks.get,
  },
}));

// SkipToMain: no-op
vi.mock("../components/SkipToMain", () => ({
  __esModule: true,
  default: () => null,
}));

/** --------- Helper --------- */
const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Login />
    </MemoryRouter>
  );

/** --------- Single Significant Test --------- */
describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("performs successful login: saves token, stores user profile, shows toast, and navigates by role", async () => {
    renderLogin();

    // Arrange mocks
    apiMocks.post.mockResolvedValueOnce({ data: { token: "jwt-token-123" } });
    apiMocks.get.mockResolvedValueOnce({
      data: [
        {
          userId: 1,
          fullName: "Admin One",
          email: "admin@example.com",
          role: { roleName: "Admin" },
        },
      ],
    });

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Assert token saved
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("jwt-token-123");
    });

    // Assert user profile saved
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("user"));
      expect(saved).toMatchObject({
        userId: 1,
        fullName: "Admin One",
        email: "admin@example.com",
        role: "admin",
      });
    });

    // Toast + navigation
    await waitFor(() => {
      expect(toastMocks.success).toHaveBeenCalled();
      expect(routerMocks.navigate).toHaveBeenCalledWith("/admin/dashboard");
    });

    // API calls verified
    expect(apiMocks.post).toHaveBeenCalledWith("/auth/login", {
      email: "admin@example.com",
      password: "secret123",
    });
    expect(apiMocks.get).toHaveBeenCalledWith("/users");
  });
});
