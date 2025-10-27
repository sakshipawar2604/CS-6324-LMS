import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SkipToMain from "../components/SkipToMain";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({ ...parsed, role: parsed.role?.toLowerCase() });
    } else {
      toast.error("Please log in first");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SkipToMain />
      {/* ===== Sidebar ===== */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-8">LMS</h2>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {/* -------- Admin Links -------- */}
          {user?.role === "admin" && (
            <>
              <NavLink
                to="/admin/dashboard"
                aria-label="Dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                <span className="text-lg" aria-hidden="true">
                  🏠
                </span>
                Dashboard
              </NavLink>

              <NavLink
                to="/admin/users"
                aria-label="Manage Users"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                <span className="text-lg" aria-hidden="true">
                  👥
                </span>
                Manage Users
              </NavLink>

              <NavLink
                to="/admin/courses"
                aria-label="Manage Courses"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                <span className="text-lg" aria-hidden="true">
                  📘
                </span>
                Manage Courses
              </NavLink>
            </>
          )}

          {/* -------- Teacher Links -------- */}
          {user?.role === "teacher" && (
            <>
              <NavLink
                to="/teacher/dashboard"
                aria-label="Dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                <span className="text-lg" aria-hidden="true">
                  🏠
                </span>
                Dashboard
              </NavLink>

              <NavLink
                to="/teacher/courses"
                aria-label="My Courses"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                <span className="text-lg" aria-hidden="true">
                  📘
                </span>
                My Courses
              </NavLink>
            </>
          )}

          {/* -------- Student Links -------- */}
          {user?.role === "student" && (
            <>
              <NavLink
                to="/student/dashboard"
                aria-label="Dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                <span className="text-lg" aria-hidden="true">
                  🏠
                </span>
                Dashboard
              </NavLink>

              <NavLink
                to="/student/courses"
                aria-label="My Courses"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                <span className="text-lg" aria-hidden="true">
                  🎓
                </span>
                My Courses
              </NavLink>
            </>
          )}
        </nav>

        {/* ===== Logout button ===== */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 mt-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ===== Main Content Area ===== */}
      <main id="main-content" className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-indigo-700">
            Hello, {user?.user?.name || "User"}
          </h2>
          <p
            className="text-sm text-gray-500 capitalize"
            aria-label={`Role: ${user?.role}`}
          >
            {user?.role}
          </p>
        </header>

        {/* Render page content here */}
        <div className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
