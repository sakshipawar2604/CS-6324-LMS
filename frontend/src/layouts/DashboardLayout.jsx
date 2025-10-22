import { Outlet, useNavigate } from "react-router-dom";
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
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-8">LMS</h2>
        <nav className="flex flex-col gap-3">
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="text-left hover:bg-indigo-600 rounded px-3 py-2"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/admin/users")}
                className="text-left hover:bg-indigo-600 rounded px-3 py-2"
              >
                Manage Users
              </button>
            </>
          )}
          {user?.role === "teacher" && (
            <>
              <button
                onClick={() => navigate("/teacher/dashboard")}
                className="text-left hover:bg-indigo-600 rounded px-3 py-2"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/teacher/courses")}
                className="text-left hover:bg-indigo-600 rounded px-3 py-2"
              >
                My Courses
              </button>
            </>
          )}
          {user?.role === "student" && (
            <>
              <button
                onClick={() => navigate("/student/dashboard")}
                className="text-left hover:bg-indigo-600 rounded px-3 py-2"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/student/assignments")}
                className="text-left hover:bg-indigo-600 rounded px-3 py-2"
              >
                Assignments
              </button>
            </>
          )}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 mt-6 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-indigo-700">
            Hello, {user?.user?.name || "User"}
          </h1>
          <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </header>

        {/* 👇 All dashboards (Admin/Teacher/Student) render here */}
        <div className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
