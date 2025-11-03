import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function ManageEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  // Modal form state
  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
  });

  // Fetch all enrollments
  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data);
    } catch (err) {
      console.error("Failed to load enrollments", err);
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const res = await api.get("/users");
      const studentList = res.data.filter(
        (u) => u.role?.roleId === 3 // Only students
      );
      setStudents(studentList);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  // Open modal for create or edit
  const openModal = (enrollment = null) => {
    setSelectedEnrollment(enrollment);
    if (enrollment) {
      setFormData({
        studentId: enrollment.student?.userId || "",
        courseId: enrollment.course?.courseId || "",
      });
    } else {
      setFormData({ studentId: "", courseId: "" });
    }
    setShowModal(true);
  };

  // Create or update enrollment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.courseId) {
      toast.error("Please select both student and course");
      return;
    }

    const payload = {
      student: { userId: Number(formData.studentId) },
      course: { courseId: Number(formData.courseId) },
      enrolledBy: { userId: 1 },
    };

    try {
      if (selectedEnrollment) {
        await api.put(
          `/enrollments/${selectedEnrollment.enrollmentId}`,
          payload
        );
        toast.success("Enrollment updated successfully!");
      } else {
        await api.post("/enrollments", payload);
        toast.success("Enrollment added successfully!");
      }

      await fetchEnrollments();
      setShowModal(false);
      setSelectedEnrollment(null);
      setFormData({ studentId: "", courseId: "" });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save enrollment");
    }
  };

  // Delete enrollment
  const handleDelete = async () => {
    if (!selectedEnrollment) return;
    try {
      await api.delete(`/enrollments/${selectedEnrollment.enrollmentId}`);
      toast.success("Enrollment deleted successfully!");
      await fetchEnrollments();
      setShowModal(false);
      setSelectedEnrollment(null);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete enrollment");
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
          Loading enrollments...
        </p>
      </div>
    );

  return (
    <div className="space-y-8" id="main-content">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">
            Manage Enrollments
          </h1>
          <p className="text-gray-600 text-sm">
            View, add, and manage student enrollments
          </p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Add a new enrollment"
        >
          + Add Enrollment
        </button>
      </div>

      {/* Enrollment Table */}
      <div className="overflow-x-auto">
        <table
          className="min-w-full bg-white shadow rounded-lg overflow-hidden"
          role="table"
          aria-label="List of enrollments"
        >
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Enrollment ID</th>
              <th className="py-3 px-4 text-left">Student</th>
              <th className="py-3 px-4 text-left">Course</th>
              <th className="py-3 px-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No enrollments found.
                </td>
              </tr>
            ) : (
              enrollments.map((e) => (
                <tr
                  key={e.enrollmentId}
                  className="border-b hover:bg-indigo-50 transition cursor-pointer"
                  onClick={() => openModal(e)}
                >
                  <td className="py-2 px-4 font-medium">{e.enrollmentId}</td>
                  <td className="py-2 px-4">{e.student?.fullName || "—"}</td>
                  <td className="py-2 px-4">{e.course?.title || "—"}</td>
                  <td className="py-2 px-4">
                    {e.enrolledAt
                      ? new Date(e.enrolledAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              {selectedEnrollment ? "Edit Enrollment" : "Add New Enrollment"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Enrollment form"
            >
              {/* Student Dropdown */}
              <div>
                <label
                  htmlFor="student-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Student
                </label>
                <select
                  id="student-select"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Dropdown */}
              <div>
                <label
                  htmlFor="course-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Course
                </label>
                <select
                  id="course-select"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between pt-4">
                {selectedEnrollment && (
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
                    {selectedEnrollment ? "Update" : "Add"}
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
