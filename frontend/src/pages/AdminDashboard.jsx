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
        toast.error("Failed to fetch admin metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse text-lg">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">No metrics available.</p>
      </div>
    );
  }

  const cards = [
    { title: "Total Users", value: metrics.total_users },
    { title: "Total Teachers", value: metrics.total_teachers },
    { title: "Total Students", value: metrics.total_students },
    { title: "Total Courses", value: metrics.total_courses },
    { title: "Total Enrollments", value: metrics.total_enrollments },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-indigo-700">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Overview of users, courses, and system activity
      </p>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div
            key={c.title}
            className="bg-white rounded-xl shadow p-6 hover:shadow-md transition"
          >
            <h3 className="text-gray-500 text-sm">{c.title}</h3>
            <p className="text-3xl font-bold text-indigo-700 mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for next steps */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-indigo-600 mb-3">
          Next Actions
        </h2>
        <ul className="list-disc ml-6 text-gray-600 text-sm space-y-2">
          <li>Manage users (teachers & students)</li>
          <li>Manage courses and assignments</li>
          <li>Review system logs and reports</li>
        </ul>
      </div>
    </div>
  );
}
