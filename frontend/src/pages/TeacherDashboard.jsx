import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const threshold = Number(import.meta.env.VITE_THRESHOLD);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const teacherId = storedUser?.userId;
        // Fetch all courses once
        const { data: allCourses } = await api.get("/courses");
        // Filter courses created by the logged-in teacher
        const teacherCourses = (allCourses || []).filter(
          (course) => course.createdBy?.userId === teacherId
        );
        setCourses(teacherCourses);
        // Fetch performance data for all teacher's courses in parallel
        const performanceResponses = await Promise.all(
          teacherCourses.map((course) =>
            api.get(
              `/courses/coursePerformanceByCourseId/${course.courseId}/${threshold}`
            )
          )
        );
        // Extract data from all responses
        const performanceData = performanceResponses.map((res) => res.data);
        setPerformance(performanceData);
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
                item.averageGradeOfStudentsInCourse >= 70
                  ? "bg-green-500"
                  : item.averageGradeOfStudentsInCourse >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500";
              return (
                <div
                  key={item.course.courseId}
                  role="listitem"
                  aria-label={`${item.course.title} - Average grade: ${item.averageGradeOfStudentsInCourse}%`}
                  className="bg-white rounded-xl p-4 shadow"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-800">
                      {item.course.title}
                    </h3>
                    <span
                      className={`text-sm font-semibold ${
                        item.averageGradeOfStudentsInCourse >= 70
                          ? "text-green-600"
                          : item.averageGradeOfStudentsInCourse >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.averageGradeOfStudentsInCourse}% Avg
                    </span>
                  </div>

                  {/* Accessible Progress Bar */}
                  <div
                    className="w-full bg-gray-200 rounded-full h-3"
                    role="progressbar"
                    aria-valuenow={item.averageGradeOfStudentsInCourse}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Average grade for ${item.course.title}: ${item.averageGradeOfStudentsInCourse}%`}
                  >
                    <div
                      className={`${color} h-3 rounded-full transition-all duration-300`}
                      style={{
                        width: `${item.averageGradeOfStudentsInCourse}%`,
                      }}
                    ></div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium text-gray-700">
                      {item.studentCountBelowThreshold}
                    </span>{" "}
                    students below {threshold}% threshold
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
