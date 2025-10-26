import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/http";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user?.user?.user_id) return;

    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const studentId = user.user.user_id;

        // 1️⃣ Enrolled courses
        const coursesRes = await api.get(`/enrollments?studentId=${studentId}`);
        setCourses(coursesRes.data || []);

        // 2️⃣ Pending assignments
        const assignmentsRes = await api.get(
          `/assignments?studentId=${studentId}&status=pending`
        );
        setPendingAssignments(assignmentsRes.data || []);

        // 3️⃣ Recent grades
        const gradesRes = await api.get(
          `/submissions?studentId=${studentId}&graded=true`
        );
        setRecentGrades(gradesRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load student dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-indigo-700">
          Student Dashboard
        </h1>
        <p className="text-gray-500">
          Your courses, assignments, and grades at a glance
        </p>
      </header>

      {/* Enrolled Courses */}
      <section aria-labelledby="courses-heading">
        <h2
          id="courses-heading"
          className="text-lg font-semibold text-indigo-600 mb-3"
        >
          My Courses
        </h2>
        {courses.length === 0 ? (
          <p className="text-gray-500 italic" role="status">
            You are not enrolled in any courses yet.
          </p>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            role="list"
            aria-label="Enrolled courses"
          >
            {courses.map((c) => (
              <article
                key={c.course_id}
                role="listitem"
                aria-label={c.title}
                tabIndex={0}
                onClick={() => navigate(`/student/courses/${c.course_id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/student/courses/${c.course_id}`);
                  }
                }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-indigo-100 hover:border-indigo-300 transition-transform hover:scale-[1.02] cursor-pointer focus-within:ring-4 focus-within:ring-indigo-300 focus-within:ring-offset-2 focus:outline-none"
              >
                <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-indigo-700 group-hover:text-indigo-800">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">
                    {c.description || "No description provided"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Enrolled on:{" "}
                    {c.enrolled_at
                      ? new Date(c.enrolled_at).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Pending Assignments */}
      <section aria-labelledby="assignments-heading">
        <h2
          id="assignments-heading"
          className="text-lg font-semibold text-indigo-600 mb-3"
        >
          Pending Assignments
        </h2>
        {pendingAssignments.length === 0 ? (
          <p className="text-gray-500 text-sm italic" role="status">
            No pending assignments 🎉
          </p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table
              className="min-w-full text-sm"
              aria-label="Pending assignments table"
            >
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th scope="col" className="py-2 px-3 text-left">
                    Title
                  </th>
                  <th scope="col" className="py-2 px-3 text-left">
                    Course
                  </th>
                  <th scope="col" className="py-2 px-3 text-left">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingAssignments.map((a) => (
                  <tr
                    key={a.assignment_id}
                    className="border-b hover:bg-indigo-50"
                  >
                    <td className="py-2 px-3">{a.title}</td>
                    <td className="py-2 px-3">{a.course_title}</td>
                    <td className="py-2 px-3">
                      {a.due_date
                        ? new Date(a.due_date).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Grades */}
      <section aria-labelledby="grades-heading">
        <h2
          id="grades-heading"
          className="text-lg font-semibold text-indigo-600 mb-3"
        >
          Recent Grades
        </h2>
        {recentGrades.length === 0 ? (
          <p className="text-gray-500 text-sm italic" role="status">
            No grades available yet.
          </p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table
              className="min-w-full text-sm"
              aria-label="Recent grades table"
            >
              <thead className="bg-green-600 text-white">
                <tr>
                  <th scope="col" className="py-2 px-3 text-left">
                    Assignment
                  </th>
                  <th scope="col" className="py-2 px-3 text-left">
                    Course
                  </th>
                  <th scope="col" className="py-2 px-3 text-left">
                    Grade
                  </th>
                  <th scope="col" className="py-2 px-3 text-left">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentGrades.map((g) => (
                  <tr
                    key={g.submission_id}
                    className="border-b hover:bg-green-50"
                  >
                    <td className="py-2 px-3">{g.assignment_title}</td>
                    <td className="py-2 px-3">{g.course_title}</td>
                    <td
                      className={`py-2 px-3 font-semibold ${
                        g.grade >= 90
                          ? "text-green-700"
                          : g.grade >= 75
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {g.grade !== null && g.grade !== undefined
                        ? `${g.grade}/100`
                        : "-"}
                    </td>

                    <td className="py-2 px-3 text-gray-600">
                      {g.feedback || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
