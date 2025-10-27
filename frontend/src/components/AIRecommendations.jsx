import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

/**
 * Shows recommendations for a student.
 * If courseId is provided → course-specific recs.
 * API contract is stable so backend can swap mock -> AI later.
 */
export default function AIRecommendations({ studentId, courseId }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const url = courseId
          ? `/student/recommendations/${courseId}/${studentId}`
          : `/student/recommendations/${studentId}`;
        const res = await api.get(url);
        setRecs(res.data || []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, courseId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-gray-500 animate-pulse">
          🤖 Analyzing your performance…
        </p>
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    );
  }

  if (!recs.length) {
    return (
      <p className="text-gray-500">🎉 No extra resources needed right now.</p>
    );
  }

  const typeIcon = (t) =>
    t === "video" ? "▶️" : t === "document" ? "📄" : "🌐";

  return (
    <ul className="space-y-3">
      {recs.map((r, idx) => (
        <li
          key={`${r.resource_title}-${idx}`}
          role="article"
          className="bg-white rounded-xl shadow p-4 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-indigo-700">
                {typeIcon(r.type)} {r.resource_title}
              </h3>
              {r.topic && (
                <p className="text-xs text-gray-500 mt-0.5">Topic: {r.topic}</p>
              )}
              {r.reason && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  💡 {r.reason}
                </p>
              )}
              {typeof r.confidence === "number" && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Confidence: {(r.confidence * 100).toFixed(0)}%
                </p>
              )}
            </div>

            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-3 py-1"
              aria-label={`Open resource: ${r.resource_title}`}
            >
              Open
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
