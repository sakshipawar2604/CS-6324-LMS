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
        // Fetch all concurrently
        const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
          api.get("/users"),
          api.get("/courses"),
          api.get("/enrollments"),
        ]);

        const users = usersRes.data || [];
        const courses = coursesRes.data || [];
        const enrollments = enrollmentsRes.data || [];

        // Filter by role
        const teachers = users.filter((u) => u.role?.roleId === 2);
        const students = users.filter((u) => u.role?.roleId === 3);

        // Build metrics
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
        <p className="text-gray-500 animate-pulse">Loading metrics...</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: metrics.total_users,
      icon: UserCircle2,
      color: "from-indigo-500 to-indigo-700",
    },
    {
      label: "Total Teachers",
      value: metrics.total_teachers,
      icon: UserCog,
      color: "from-blue-500 to-blue-700",
    },
    {
      label: "Total Students",
      value: metrics.total_students,
      icon: GraduationCap,
      color: "from-green-500 to-green-700",
    },
    {
      label: "Total Courses",
      value: metrics.total_courses,
      icon: BookOpen,
      color: "from-purple-500 to-purple-700",
    },
    {
      label: "Total Enrollments",
      value: metrics.total_enrollments,
      icon: Layers,
      color: "from-pink-500 to-pink-700",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-indigo-700">Admin Dashboard</h1>
        <p className="text-gray-500">
          Overview of users, courses, and enrollments
        </p>
      </header>

      {/* Metrics grid */}
      <div className="max-w-6xl mx-auto">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Dashboard metrics"
        >
          {cards.map(({ label, value, icon: Icon, color }) => (
            <article
              key={label}
              role="listitem"
              aria-label={`${label}: ${value}`}
              className={`rounded-xl shadow-lg bg-gradient-to-br ${color} text-white p-6 flex flex-col justify-between hover:scale-105 transition-transform focus-within:ring-4 focus-within:ring-indigo-300 focus-within:ring-offset-2`}
              tabIndex={0}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={40} strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <p className="text-5xl font-extrabold mb-2" aria-live="polite">
                  {value}
                </p>
                <p className="text-base font-medium opacity-90">{label}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
