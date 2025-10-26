import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
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
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                🏠 Dashboard
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                👥 Manage Users
              </NavLink>

              {/* Add Manage Courses later */}
              {/* <button
                onClick={() => navigate("/admin/courses")}
                className="flex items-center gap-2 text-left hover:bg-indigo-600 rounded px-3 py-2"
              >
                📘 Manage Courses
              </button> */}
            </>
          )}

          {/* -------- Teacher Links -------- */}
          {user?.role === "teacher" && (
            <>
              <NavLink
                to="/teacher/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                🏠 Dashboard
              </NavLink>

              <NavLink
                to="/teacher/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                📘 My Courses
              </NavLink>
            </>
          )}

          {/* -------- Student Links -------- */}
          {user?.role === "student" && (
            <>
              <NavLink
                to="/student/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                🏠 Dashboard
              </NavLink>

              <NavLink
                to="/student/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                🎓 My Courses
              </NavLink>

              <NavLink
                to="/student/assignments"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`
                }
              >
                🧾 Assignments
              </NavLink>
            </>
          )}
        </nav>

        {/* ===== Logout button ===== */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 mt-6 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ===== Main Content Area ===== */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-indigo-700">
            Hello, {user?.user?.name || "User"}
          </h1>
          <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </header>

        {/* Render page content here */}
        <div className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
