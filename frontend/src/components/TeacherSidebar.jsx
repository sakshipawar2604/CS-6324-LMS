// src/components/TeacherSidebar.jsx
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function TeacherSidebar() {
  const navigate = useNavigate();

  const navItems = [
    { to: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/teacher/courses", label: "My Courses", icon: BookOpen },
    { to: "/teacher/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/teacher/resources", label: "Resources", icon: FileText },
    { to: "/teacher/students", label: "Students", icon: Users },
  ];

  const baseStyle =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <aside
      className="flex flex-col w-60 bg-indigo-900 text-white h-screen p-4"
      aria-label="Teacher sidebar"
    >
      {/* Logo / Brand */}
      <div className="text-2xl font-bold mb-8 tracking-wide text-center text-white/90">
        LMS Portal
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${baseStyle} ${
                isActive
                  ? "bg-indigo-700 font-semibold"
                  : "hover:bg-indigo-800 hover:text-white/90"
              }`
            }
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={() => {
          localStorage.removeItem("user");
          navigate("/login");
        }}
        className="mt-auto flex items-center gap-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-all text-sm"
        aria-label="Logout"
      >
        <LogOut className="w-5 h-5" aria-hidden="true" />
        Logout
      </button>
    </aside>
  );
}
