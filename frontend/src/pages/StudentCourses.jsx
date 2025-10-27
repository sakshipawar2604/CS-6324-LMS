import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/http";

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Mock call (replace with backend later)
        const res = await api.get("/student/courses?studentId=STU001");
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load student courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading your courses...</p>
      </div>
    );
  }

  return (
    <main id="main-content" className="space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">My Courses</h1>
      <p className="text-gray-500">
        List of courses you’re currently enrolled in.
      </p>

      {courses.length === 0 ? (
        <p className="text-gray-600 mt-4">
          You are not enrolled in any courses yet.
        </p>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Instructor
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Enrolled On
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.course_id}
                  className="border-b hover:bg-indigo-50 transition"
                >
                  <td className="px-6 py-4 text-indigo-700 font-semibold">
                    {course.title}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {course.instructor || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(course.enrolled_on).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        navigate(`/student/courses/${course.course_id}`)
                      }
                      className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-3 py-1"
                    >
                      View Course
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
