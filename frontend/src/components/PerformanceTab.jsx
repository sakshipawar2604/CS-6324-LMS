import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function PerformanceTab({ courseId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get(`/teacher/courses/${courseId}/performance`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [courseId]);

  if (loading) {
    return (
      <p className="text-gray-500 animate-pulse">Loading performance...</p>
    );
  }

  if (data.length === 0) {
    return <p className="text-gray-400 italic">No performance data yet.</p>;
  }

  return (
    <section
      aria-label="Student performance overview"
      className="space-y-4 mt-4"
    >
      {data.map((student) => {
        const grade = student.average_grade;
        const color =
          grade >= 70
            ? "bg-green-500"
            : grade >= 50
            ? "bg-yellow-500"
            : "bg-red-500";

        const label =
          grade >= 70
            ? "On Track"
            : grade >= 50
            ? "Needs Improvement"
            : "Critical Performance";

        return (
          <div
            key={student.student_name}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-gray-800">
                {student.student_name}
              </h3>
              <span
                className={`text-sm font-semibold ${
                  grade >= 70
                    ? "text-green-600"
                    : grade >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {grade}%
              </span>
            </div>

            {/* Accessible Progress Bar */}
            <div
              className="w-full bg-gray-200 rounded-full h-3"
              role="progressbar"
              aria-valuenow={grade}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`${student.student_name} — ${grade}% average (${label})`}
            >
              <div
                className={`${color} h-3 rounded-full transition-all duration-300`}
                style={{ width: `${grade}%` }}
              ></div>
            </div>

            <p className="text-sm text-gray-600 mt-1">{label}</p>
          </div>
        );
      })}
    </section>
  );
}
