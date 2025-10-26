import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    created_by: "",
  });

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch teacher list for dropdown
  const fetchTeachers = async () => {
    try {
      const res = await api.get("/admin/users"); // same mock list
      const onlyTeachers = res.data.filter((u) => u.role === "Teacher");
      setTeachers(onlyTeachers);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  // Handle course creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.description || !newCourse.created_by) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await api.post("/admin/courses", newCourse);
      setCourses((prev) => [...prev, res.data]);
      toast.success("Course created successfully!");
      setShowModal(false);
      setNewCourse({ title: "", description: "", created_by: "" });
    } catch (err) {
      toast.error("Failed to create course");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <p
          className="text-gray-500 animate-pulse"
          role="status"
          aria-live="polite"
        >
          Loading courses...
        </p>
      </div>
    );

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Manage Courses</h1>
          <p className="text-gray-500">View, create, and manage courses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          aria-label="Add new course"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          + Add Course
        </button>
      </header>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table
          className="min-w-full text-left border-collapse"
          aria-label="Courses table"
        >
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">
                Title
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Description
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Teacher
              </th>
              <th scope="col" className="px-6 py-3 font-medium">
                Created On
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr
                  key={course.course_id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-3 font-medium">{course.title}</td>
                  <td className="px-6 py-3">{course.description}</td>
                  <td className="px-6 py-3">{course.created_by}</td>
                  <td className="px-6 py-3">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-indigo-700 mb-4"
            >
              Create New Course
            </h2>

            <form
              onSubmit={handleCreateCourse}
              className="space-y-4"
              aria-label="Create course form"
            >
              <div>
                <label
                  htmlFor="course-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  id="course-title"
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="course-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="course-description"
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="course-teacher"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assign Teacher
                </label>
                <select
                  id="course-teacher"
                  value={newCourse.created_by}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, created_by: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                  required
                >
                  <option value="">Select a Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.email} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
