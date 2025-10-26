import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
  const navigate = useNavigate();

  // Sidebar links
  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
    { label: "Manage Users", path: "/admin/users", icon: "👥" },
    { label: "Manage Courses", path: "/admin/courses", icon: "📘" },
    { label: "Manage Enrollments", path: "/admin/enrollments", icon: "📚" },
    // Future extensions
    // { label: "Reports", path: "/admin/reports", icon: "📊" },
  ];

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-indigo-700 text-white flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="text-center font-bold text-2xl py-5 border-b border-indigo-500">
          LMS Admin
        </div>

        {/* Nav links */}
        <nav
          className="mt-6 flex flex-col space-y-2 px-4"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 ${
                  isActive
                    ? "bg-indigo-600 font-semibold ring-2 ring-white"
                    : ""
                }`
              }
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div className="px-4 py-6">
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
