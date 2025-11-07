import { BarChart3, FileText, ExternalLink, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function PerformanceTab({ courseId, studentId, role }) {
  const [performance, setPerformance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "teacher") {
          const res = await api.get(
            `/submissions/averageGradesOfStudentsInACourse/${courseId}`
          );
          setStudentList(res.data || []);
        } else if (role === "student") {
          // Student: Fetch own performance and recommendations
          const [perfRes, recRes] = await Promise.all([
            api
              .get(`/student/performance/${studentId}/${courseId}`)
              .catch(() => ({ data: null })),
            api
              .get(`/student/recommendations/${studentId}/${courseId}`)
              .catch(() => ({ data: [] })),
          ]);
          setPerformance(perfRes.data);
          setRecommendations(recRes.data || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };
    if (courseId && (role === "teacher" || (role === "student" && studentId))) {
      fetchData();
    }
  }, [courseId, studentId, role]);

  if (loading) {
    return (
      <p className="text-gray-500 animate-pulse">Loading performance data...</p>
    );
  }

  // ===== TEACHER VIEW: Student Performance List =====
  if (role === "teacher") {
    if (studentList.length === 0) {
      return (
        <p className="text-gray-500">No performance data available yet.</p>
      );
    }

    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Student Performance Overview
          </h2>
        </div>

        <div className="space-y-4">
          {studentList.map((student) => {
            const grade = student.averagePercentage;
            console.log("grade:-", grade);
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
                key={student.userDto.fullName}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-gray-800">
                    {student.userDto.fullName}
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
                  aria-label={`${student.userDto.fullName} — ${grade}% average (${label})`}
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
        </div>
      </section>
    );
  }

  // ===== STUDENT VIEW: Own Performance + AI Recommendations =====
  if (!performance) {
    return <p className="text-gray-500">No performance data available yet.</p>;
  }

  return (
    <section className="space-y-8">
      {/* Course Performance Summary */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Course Performance
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Your current average:{" "}
          <span className="text-indigo-700 font-semibold">
            {performance.avg_grade}/100
          </span>
        </p>

        <div className="space-y-5">
          {performance.assignments?.map((item) => {
            const color =
              item.grade >= 70
                ? "bg-green-500"
                : item.grade >= 50
                ? "bg-yellow-400"
                : "bg-red-500";
            return (
              <div key={item.assignment_id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {item.title}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      item.grade >= 70 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.grade}/100
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`${color} h-full rounded-full transition-all`}
                    style={{ width: `${item.grade}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            AI-Based Recommendations
          </h2>
        </div>

        {recommendations.length > 0 ? (
          <ul className="space-y-4">
            {recommendations.map((rec, index) => (
              <li
                key={index}
                className="border border-gray-100 rounded-lg p-4 hover:shadow transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {rec.resource_title}
                    </h3>
                    <p className="text-xs text-gray-500">{rec.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Confidence: {(rec.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                  >
                    Open <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">
            No personalized recommendations at this time.
          </p>
        )}
      </div>
    </section>
  );
}
