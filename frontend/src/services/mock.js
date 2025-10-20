// enable axios mocks in development only
import MockAdapter from "axios-mock-adapter";
import api from "./http";
import authData from "../mock/auth.json";

/**
 * Call this once at app start in dev to register mocks.
 * Replace this whole file with nothing when you connect Spring Boot.
 */
export function setupMocks() {
  if (import.meta.env.PROD) return; // don't mock in production

  const mock = new MockAdapter(api, { delayResponse: 400 }); // small delay to feel real

  // ---- AUTH ----
  mock.onPost("/auth/login").reply((config) => {
    try {
      const body = JSON.parse(config.data || "{}");
      const { email, password } = body || {};
      const found = authData.users.find(
        (u) => u.email === email && u.password === password
      );
      if (!found) {
        return [401, { message: "Invalid credentials" }];
      }
      const token = authData.tokens[found.role] || "mock-jwt";
      return [
        200,
        {
          token,
          role: found.role,
          user: {
            email: found.email,
            name: found.role.toUpperCase() + " User",
          },
        },
      ];
    } catch {
      return [400, { message: "Bad request" }];
    }
  });

  // ---- EXAMPLE: protected endpoint placeholders (can expand later) ----
  mock.onGet("/admin/metrics").reply(200, {
    totalUsers: 42,
    totalCourses: 10,
    totalEnrollments: 120,
    pendingSubmissions: 7,
  });

  // fallback: let any unmatched request pass through (to real backend if running)
  mock.onAny().passThrough();
}
