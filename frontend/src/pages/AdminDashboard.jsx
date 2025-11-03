import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";
import {
  UserCircle2,
  UserCog,
  GraduationCap,
  BookOpen,
  Layers,
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
      color: "from-indigo-500/90 to-indigo-700/90",
      accent: "text-indigo-300",
    },
    {
      label: "Total Teachers",
      value: metrics.total_teachers,
      icon: UserCog,
      color: "from-blue-500/90 to-blue-700/90",
      accent: "text-blue-300",
    },
    {
      label: "Total Students",
      value: metrics.total_students,
      icon: GraduationCap,
      color: "from-green-500/90 to-green-700/90",
      accent: "text-green-300",
    },
    {
      label: "Total Courses",
      value: metrics.total_courses,
      icon: BookOpen,
      color: "from-purple-500/90 to-purple-700/90",
      accent: "text-purple-300",
    },
    {
      label: "Total Enrollments",
      value: metrics.total_enrollments,
      icon: Layers,
      color: "from-pink-500/90 to-pink-700/90",
      accent: "text-pink-300",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-1">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Real-time overview of users, courses, and enrollments
        </p>
      </header>

      {/* Metrics grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Dashboard metrics"
        >
          {cards.map(({ label, value, icon: Icon, color, accent }) => (
            <article
              key={label}
              role="listitem"
              aria-label={`${label}: ${value}`}
              tabIndex={0}
              className={`relative rounded-2xl bg-gradient-to-br ${color} 
              text-white p-6 backdrop-blur-lg shadow-lg
              flex flex-col justify-between border border-white/10
              hover:scale-105 hover:shadow-2xl hover:border-white/30 transition-all duration-300
              focus-within:ring-4 focus-within:ring-indigo-300 focus-within:ring-offset-2`}
            >
              {/* Soft glow behind icon */}
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-white/10 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

              <div className="flex items-center justify-between mb-4">
                <Icon
                  size={42}
                  strokeWidth={2.5}
                  className={`${accent} drop-shadow-lg`}
                  aria-hidden="true"
                />
              </div>

              <div>
                <AnimatedCounter target={value} />
                <p className="text-base font-medium opacity-90 mt-1 tracking-wide">
                  {label}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Animated count-up effect */
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    const duration = 1000; // 1s
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
    <p className="text-5xl font-extrabold mb-2 tracking-tight drop-shadow-md">
      {count.toLocaleString()}
    </p>
  );
}
