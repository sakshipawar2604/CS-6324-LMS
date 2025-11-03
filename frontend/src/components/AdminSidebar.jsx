import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
} from "lucide-react"; // ✅ Lucide React icons

export default function AdminSidebar() {
  const navigate = useNavigate();

  // Sidebar links
  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Users", path: "/admin/users", icon: Users },
    { label: "Manage Courses", path: "/admin/courses", icon: BookOpen },
    {
      label: "Manage Enrollments",
      path: "/admin/enrollments",
      icon: GraduationCap,
    },
    // { label: "Reports", path: "/admin/reports", icon: BarChart3 }, // for future
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
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              aria-label={label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 ${
                  isActive
                    ? "bg-indigo-600 font-semibold ring-2 ring-white"
                    : ""
                }`
              }
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div className="px-4 py-6">
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
        >
          <LogOut size={18} aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}
