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
    if (!user?.userId) return;

    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const studentId = user.userId;

        //  Fetch all enrollments and filter for this student
        const enrollmentsRes = await api
          .get(`/enrollments`)
          .catch(() => ({ data: [] }));
        const allEnrollments = enrollmentsRes.data || [];

        // Filter enrollments for this student
        const studentEnrollments = allEnrollments.filter(
          (e) => e.student?.userId === studentId
        );

        //  Extract course info from each enrollment
        const courses = studentEnrollments.map((e) => ({
          courseId: e.course?.courseId,
          title: e.course?.title,
          description: e.course?.description,
          enrolledAt: e.enrolledAt,
        }));

        setCourses(courses);

        // Fetch all assignments and filter for this student
        const assignmentsRes = await api
          .get(`/assignments`)
          .catch(() => ({ data: [] }));
        const allAssignments = assignmentsRes.data || [];

        // Fetch all submissions to check which assignments are already submitted
        const submissionsRes = await api
          .get(`/submissions`)
          .catch(() => ({ data: [] }));
        const allSubmissions = submissionsRes.data || [];

        // Filter assignments for courses this student is enrolled in
        const enrolledCourseIds = new Set(courses.map((c) => c.courseId));
        const studentAssignments = allAssignments.filter((a) =>
          enrolledCourseIds.has(a.course?.courseId)
        );

        // Get list of assignment IDs that this student has already submitted
        const submittedAssignmentIds = new Set(
          allSubmissions
            .filter((s) => s.student?.userId === studentId)
            .map((s) => s.assignment?.assignmentId)
        );

        // Filter pending assignments:
        // 1. Not submitted yet by this student
        // 2. Due date is in the future (or no due date)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pending = studentAssignments
          .filter((a) => {
            // Skip if already submitted
            if (submittedAssignmentIds.has(a.assignmentId)) {
              return false;
            }
            // If no due date, consider it pending
            if (!a.dueDate) return true;
            // Check if due date is today or in the future
            const dueDate = new Date(a.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today;
          })
          .map((a) => ({
            assignment_id: a.assignmentId,
            title: a.title,
            course_title: a.course?.title || "Unknown",
            due_date: a.dueDate,
          }));

        setPendingAssignments(pending);

        // Filter submissions for this student that have grades
        const gradedSubmissions = allSubmissions.filter(
          (s) => s.student?.userId === studentId && s.grade != null
        );

        // Sort by submittedAt (most recent first), then limit to top 5
        const sortedAndLimited = gradedSubmissions
          .sort((a, b) => {
            // Most recent first (newest at top)
            const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            return dateB - dateA; // Descending order (newest first)
          })
          .slice(0, 5); // Limit to 5 most recent

        // Map to format expected by UI
        const grades = sortedAndLimited.map((s) => ({
          submission_id: s.submissionId,
          assignment_title: s.assignment?.title || "Unknown",
          course_title: s.assignment?.course?.title || "Unknown",
          grade: s.grade,
          feedback: s.feedback,
        }));

        setRecentGrades(grades);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
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
                key={c.courseId}
                role="listitem"
                aria-label={c.title}
                tabIndex={0}
                onClick={() => navigate(`/student/courses/${c.courseId}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/student/courses/${c.courseId}`);
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
                    {c.enrolledAt
                      ? new Date(c.enrolledAt).toLocaleDateString()
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
                    key={a.assignment_id || a.assignmentId}
                    className="border-b hover:bg-indigo-50"
                  >
                    <td className="py-2 px-3">{a.title}</td>
                    <td className="py-2 px-3">
                      {a.course_title || a.course?.title}
                    </td>
                    <td className="py-2 px-3">
                      {a.due_date || a.dueDate
                        ? new Date(a.due_date || a.dueDate).toLocaleDateString()
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
                      className={`py-2 px-3 font-semibold ${(() => {
                        const gradeNum = Number(g.grade);
                        if (isNaN(gradeNum)) return "text-gray-600";
                        if (gradeNum >= 90) return "text-green-700"; // Excellent (A)
                        if (gradeNum >= 75) return "text-yellow-600"; // Average (C)
                        return "text-red-600"; // Low (F/D)
                      })()}`}
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
