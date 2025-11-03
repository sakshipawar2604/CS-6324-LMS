import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const teacherId = storedUser?.userId;

        const [coursesRes, performanceRes] = await Promise.all([
          api.get("/courses"),
          api.get("/teacher/performance"),
        ]);

        // Filter only courses created by the logged-in teacher
        const teacherCourses = (coursesRes.data || []).filter(
          (course) => course.createdBy?.userId === teacherId
        );

        setCourses(teacherCourses);
        setPerformance(performanceRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div id="main-content" className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-indigo-700">
          Teacher Dashboard
        </h1>
        <p className="text-gray-600 text-sm">
          Quick overview of your courses and student performance
        </p>
      </header>

      {/* Assigned Courses */}
      <section aria-label="Assigned courses overview">
        <h2 className="text-lg font-semibold text-indigo-600 mb-3">
          Assigned Courses
        </h2>
        {loading ? (
          <p
            className="text-gray-500 animate-pulse"
            role="status"
            aria-live="polite"
          >
            Loading...
          </p>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label="Courses list"
          >
            {courses.map((course) => (
              <div
                key={course.courseId}
                role="listitem"
                aria-label={course.title}
                className="p-4 bg-white rounded-xl shadow hover:shadow-md transition"
              >
                <h3 className="text-indigo-700 font-semibold">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {course.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Performance Section */}
      <section aria-label="Performance overview">
        <h2 className="text-lg font-semibold text-indigo-600 mb-3">
          Course Performance
        </h2>
        {loading ? (
          <p
            className="text-gray-500 animate-pulse"
            role="status"
            aria-live="polite"
          >
            Loading...
          </p>
        ) : performance.length === 0 ? (
          <p className="text-gray-400 italic" role="status">
            No performance data available.
          </p>
        ) : (
          <div
            className="space-y-4"
            role="list"
            aria-label="Performance metrics"
          >
            {performance.map((item) => {
              const color =
                item.average_grade >= 70
                  ? "bg-green-500"
                  : item.average_grade >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500";

              return (
                <div
                  key={item.course_id}
                  role="listitem"
                  aria-label={`${item.course_title} - Average grade: ${item.average_grade}%`}
                  className="bg-white rounded-xl p-4 shadow"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-800">
                      {item.course_title}
                    </h3>
                    <span
                      className={`text-sm font-semibold ${
                        item.average_grade >= 70
                          ? "text-green-600"
                          : item.average_grade >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.average_grade}% Avg
                    </span>
                  </div>

                  {/* Accessible Progress Bar */}
                  <div
                    className="w-full bg-gray-200 rounded-full h-3"
                    role="progressbar"
                    aria-valuenow={item.average_grade}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Average grade for ${item.course_title}: ${item.average_grade}%`}
                  >
                    <div
                      className={`${color} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${item.average_grade}%` }}
                    ></div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium text-gray-700">
                      {item.below_threshold}
                    </span>{" "}
                    students below 70% threshold
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
