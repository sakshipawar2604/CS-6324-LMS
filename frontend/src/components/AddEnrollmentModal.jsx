import { useState, useEffect, useRef } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

export default function AddEnrollmentModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    student_name: "",
    course_title: "",
  });
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // focus trap for accessibility
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/enrollments/add", form);
      toast.success("Enrollment added successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add enrollment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-enrollment-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
        ref={modalRef}
        tabIndex="-1"
      >
        <h2
          id="add-enrollment-title"
          className="text-xl font-semibold text-indigo-700 mb-4"
        >
          Add New Enrollment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Name */}
          <div>
            <label
              htmlFor="student_name"
              className="block text-sm font-medium text-gray-700"
            >
              Student Name{" "}
              <span className="text-red-600" aria-label="required">
                *
              </span>
            </label>
            <input
              id="student_name"
              name="student_name"
              value={form.student_name}
              onChange={handleChange}
              aria-required="true"
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          {/* Course Title */}
          <div>
            <label
              htmlFor="course_title"
              className="block text-sm font-medium text-gray-700"
            >
              Course Title{" "}
              <span className="text-red-600" aria-label="required">
                *
              </span>
            </label>
            <input
              id="course_title"
              name="course_title"
              value={form.course_title}
              onChange={handleChange}
              aria-required="true"
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
