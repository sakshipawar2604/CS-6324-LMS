import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";
import AIRecommendations from "./AIRecommendations";

export default function CoursePerformanceStudent({ courseId, studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(
          `/student/performance/${studentId}/${courseId}`
        );
        setData(res.data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load performance");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, studentId]);

  if (loading) {
    return <p className="text-gray-500 animate-pulse">Loading performance…</p>;
  }

  if (!data) {
    return <p className="text-gray-500">No performance data yet.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <section aria-label="Your performance overview">
        <h3 className="text-lg font-semibold text-indigo-700 mb-2">
          📊 Your Course Performance
        </h3>
        <p className="text-gray-700">
          Average grade:{" "}
          <span className="font-bold text-indigo-700">
            {data.avg_grade}/100
          </span>
        </p>

        <div className="mt-4 space-y-4">
          {data.assignments.map((a) => {
            const good = a.grade >= 70;
            return (
              <div key={a.assignment_id}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800">{a.title}</p>
                  <span
                    className={`text-sm font-semibold ${
                      good ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {a.grade}/100
                  </span>
                </div>
                <div
                  className="w-full bg-gray-200 rounded-full h-3 mt-1"
                  role="progressbar"
                  aria-valuenow={a.grade}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Grade ${a.grade} out of 100 for ${a.title}`}
                >
                  <div
                    className={`${
                      good ? "bg-green-500" : "bg-red-400"
                    } h-3 rounded-full`}
                    style={{ width: `${a.grade}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {good ? "On track" : "Needs improvement"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Recommendations */}
      <section aria-label="AI recommended modules">
        <h3 className="text-lg font-semibold text-indigo-700 mb-2">
          🎯 Personalized Recommendations
        </h3>
        <AIRecommendations studentId={studentId} courseId={courseId} />
      </section>
    </div>
  );
}
