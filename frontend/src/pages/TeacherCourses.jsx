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
      try {
        const res = await api.get("/teacher/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
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
                  tabIndex="0"
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
                    {new Date(course.created_at).toLocaleDateString()}
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
