import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get("/admin/metrics");
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch metrics");
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

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: metrics.total_users ?? 0,
      icon: "👥",
      color: "from-indigo-500 to-indigo-700",
    },
    {
      label: "Total Teachers",
      value: metrics.total_teachers ?? 0,
      icon: "🧑‍🏫",
      color: "from-blue-500 to-blue-700",
    },
    {
      label: "Total Students",
      value: metrics.total_students ?? 0,
      icon: "🎓",
      color: "from-green-500 to-green-700",
    },
    {
      label: "Total Courses",
      value: metrics.total_courses ?? 0,
      icon: "📘",
      color: "from-purple-500 to-purple-700",
    },
    {
      label: "Total Enrollments",
      value: metrics.total_enrollments ?? 0,
      icon: "📚",
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
          {cards.map((card) => (
            <article
              key={card.label}
              role="listitem"
              aria-label={`${card.label}: ${card.value}`}
              className={`rounded-xl shadow-lg bg-gradient-to-br ${card.color} text-white p-6 flex flex-col justify-between hover:scale-105 transition-transform focus-within:ring-4 focus-within:ring-indigo-300 focus-within:ring-offset-2`}
              tabIndex={0}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl" aria-hidden="true">
                  {card.icon}
                </span>
              </div>
              <div>
                <p className="text-5xl font-extrabold mb-2" aria-live="polite">
                  {card.value}
                </p>
                <p className="text-base font-medium opacity-90">{card.label}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
