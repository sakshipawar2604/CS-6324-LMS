import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/http";
import toast from "react-hot-toast";

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Backend returns an array of enrollments (each has { course, student, enrolledAt, ... })
        const res = await api.get("/enrollments");
        const enrollments = Array.isArray(res.data) ? res.data : [];

        // Optional: filter to only courses created by this teacher (if you have user info stored)
        let currentTeacherId = null;
        try {
          const raw = localStorage.getItem("user");
          if (raw) currentTeacherId = JSON.parse(raw)?.userId || null;
        } catch {}

        const map = new Map();
        for (const e of enrollments) {
          const c = e.course;
          if (!c) continue;

          // If you want to strictly show only this teacher's courses (when you know the teacher id):
          if (currentTeacherId && c.createdBy?.userId !== currentTeacherId)
            continue;

          const key = c.courseId;
          if (!map.has(key)) {
            map.set(key, {
              id: c.courseId,
              title: c.title,
              description: c.description,
              // we’ll count unique students per course
              _studentIds: new Set(),
              created_at: c.createdAt, // ISO string from backend
            });
          }
          const row = map.get(key);
          const sid = e.student?.userId;
          if (sid != null) row._studentIds.add(sid);
        }

        // finalize rows
        const rows = Array.from(map.values()).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          students_enrolled: r._studentIds.size,
          created_at: r.created_at,
        }));

        // newest first (optional)
        rows.sort((a, b) =>
          (b.created_at || "").localeCompare(a.created_at || "")
        );

        setCourses(rows);
      } catch (err) {
        console.error("Error fetching enrollments/courses:", err);
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div id="main-content" className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">My Courses</h1>
          <p className="text-gray-600 text-sm">
            List of courses you’re currently teaching
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-400 italic">No courses assigned yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="min-w-full bg-white shadow rounded-lg overflow-hidden"
            role="table"
            aria-label="List of courses assigned to teacher"
          >
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th scope="col" className="py-3 px-4 text-left">
                  Course ID
                </th>
                <th scope="col" className="py-3 px-4 text-left">
                  Title
                </th>
                <th scope="col" className="py-3 px-4 text-left">
                  Description
                </th>
                <th scope="col" className="py-3 px-4 text-left">
                  Students
                </th>
                <th scope="col" className="py-3 px-4 text-left">
                  Created On
                </th>
                <th scope="col" className="py-3 px-4 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr
                  key={course.id}
                  tabIndex={0}
                  className={`border-b hover:bg-indigo-50 focus-within:bg-indigo-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-2 px-4">{course.id}</td>
                  <td className="py-2 px-4 font-medium text-gray-800">
                    {course.title}
                  </td>
                  <td className="py-2 px-4 text-gray-600 max-w-sm truncate">
                    {course.description}
                  </td>
                  <td className="py-2 px-4">{course.students_enrolled}</td>
                  <td className="py-2 px-4">
                    {course.created_at
                      ? new Date(course.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => navigate(`/teacher/courses/${course.id}`)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-label={`Open details for ${course.title}`}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
