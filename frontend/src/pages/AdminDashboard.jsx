import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/http";
import toast from "react-hot-toast";
import {
  UserCircle2,
  UserCog,
  GraduationCap,
  BookOpen,
  Layers,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    total_users: 0,
    total_teachers: 0,
    total_students: 0,
    total_courses: 0,
    total_enrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
          api.get("/users"),
          api.get("/courses"),
          api.get("/enrollments"),
        ]);

        const users = usersRes.data || [];
        const courses = coursesRes.data || [];
        const enrollments = enrollmentsRes.data || [];

        const teachers = users.filter((u) => u.role?.roleId === 2);
        const students = users.filter((u) => u.role?.roleId === 3);

        setMetrics({
          total_users: users.length,
          total_teachers: teachers.length,
          total_students: students.length,
          total_courses: courses.length,
          total_enrollments: enrollments.length,
        });
      } catch (err) {
        console.error("Failed to fetch metrics", err);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 animate-pulse text-lg font-medium">
          Loading metrics...
        </p>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: metrics.total_users,
      icon: UserCircle2,
      color: "from-indigo-500/80 to-indigo-700/80",
      glow: "shadow-indigo-400/40",
      onClick: () => navigate("/admin/users"),
    },
    {
      label: "Total Teachers",
      value: metrics.total_teachers,
      icon: UserCog,
      color: "from-blue-500/80 to-blue-700/80",
      glow: "shadow-blue-400/40",
      onClick: () => navigate("/admin/users?filter=teacher"),
    },
    {
      label: "Total Students",
      value: metrics.total_students,
      icon: GraduationCap,
      color: "from-green-500/80 to-green-700/80",
      glow: "shadow-green-400/40",
      onClick: () => navigate("/admin/users?filter=student"),
    },
    {
      label: "Total Courses",
      value: metrics.total_courses,
      icon: BookOpen,
      color: "from-purple-500/80 to-purple-700/80",
      glow: "shadow-purple-400/40",
      onClick: () => navigate("/admin/courses"),
    },
    {
      label: "Total Enrollments",
      value: metrics.total_enrollments,
      icon: Layers,
      color: "from-pink-500/80 to-pink-700/80",
      glow: "shadow-pink-400/40",
      onClick: () => navigate("/admin/enrollments"),
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-1">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Real-time overview of users, courses, and enrollments
        </p>
      </header>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map(({ label, value, icon: Icon, color, glow, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`group relative rounded-2xl bg-gradient-to-br ${color} 
              text-white p-6 shadow-lg ${glow} hover:shadow-2xl
              backdrop-blur-xl border border-white/10 
              hover:scale-[1.03] transition-all duration-300 ease-out 
              overflow-hidden focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2`}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white blur-2xl transition"></div>

              {/* Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                    <Icon size={28} strokeWidth={2.3} className="text-white" />
                  </div>
                  <p className="text-lg font-semibold tracking-wide">{label}</p>
                </div>
                <TrendingUp
                  size={20}
                  className="text-white/70 group-hover:text-white transition"
                />
              </div>

              {/* Number + Tagline */}
              <div className="flex items-end justify-between mt-6">
                <AnimatedCounter target={value} />
                <span className="text-sm opacity-80 italic">View Details</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Smooth count-up animation */
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    const duration = 1000;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <p className="text-5xl font-extrabold tracking-tight drop-shadow-md">
      {count.toLocaleString()}
    </p>
  );
}
