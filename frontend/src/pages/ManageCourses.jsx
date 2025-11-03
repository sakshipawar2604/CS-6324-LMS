import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Modal form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    createdBy: "",
  });

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch teacher list
  const fetchTeachers = async () => {
    try {
      const res = await api.get("/users"); // get all users
      const onlyTeachers = res.data.filter((user) => user.role?.roleId === 2);
      setTeachers(onlyTeachers);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
      toast.error("Unable to load teacher list");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  // Handle open modal (for create or edit)
  const openModal = (course = null) => {
    setSelectedCourse(course);
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        createdBy: course.createdBy?.userId || "",
      });
    } else {
      setFormData({ title: "", description: "", createdBy: "" });
    }
    setShowModal(true);
  };

  // Handle create or update course
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.createdBy) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      createdBy: { userId: Number(formData.createdBy) },
    };

    try {
      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse.courseId}`, payload);

        await fetchCourses();

        toast.success("Course updated successfully!");
      } else {
        await api.post("/courses", payload);

        await fetchCourses();

        toast.success("Course created successfully!");
      }

      // Reset modal + form
      setShowModal(false);
      setSelectedCourse(null);
      setFormData({ title: "", description: "", createdBy: "" });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save course");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      await api.delete(`/courses/${selectedCourse.courseId}`);
      setCourses((prev) =>
        prev.filter((c) => c.courseId !== selectedCourse.courseId)
      );
      toast.success("Course deleted successfully!");
      setShowModal(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete course");
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
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Manage Courses</h1>
          <p className="text-gray-500">View, create, and manage courses</p>
        </div>
        <button
          onClick={() => openModal(null)}
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
                  key={course.courseId}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => openModal(course)} // open edit modal
                >
                  <td className="px-6 py-3 font-medium">{course.title}</td>
                  <td className="px-6 py-3">{course.description}</td>
                  <td className="px-6 py-3">
                    {course.createdBy?.fullName || "—"}
                  </td>
                  <td className="px-6 py-3">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal (Create / Edit / Delete) */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              {selectedCourse ? "Edit Course" : "Create New Course"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Course form"
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
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
                  value={formData.createdBy}
                  onChange={(e) =>
                    setFormData({ ...formData, createdBy: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none"
                  required
                >
                  <option value="">Select a Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.userId} value={t.userId}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between pt-4">
                {selectedCourse && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
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
                    {selectedCourse ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
