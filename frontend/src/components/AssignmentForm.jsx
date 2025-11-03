import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/http";

export default function AssignmentForm({
  courseId,
  onClose,
  onSuccess,
  existing,
}) {
  const isEdit = Boolean(existing);
  const [formData, setFormData] = useState({
    title: existing?.title || "",
    description: existing?.description || "",
    dueDate: existing?.dueDate || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.dueDate) {
      toast.error("All fields are required");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      course: { courseId: Number(courseId) },
    };

    try {
      if (isEdit) {
        await api.put(`/assignments/${existing.assignmentId}`, payload);
        toast.success("Assignment updated successfully!");
      } else {
        await api.post("/assignments", payload);
        toast.success("Assignment created successfully!");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to save assignment", err);
      toast.error("Failed to save assignment");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">
          {isEdit ? "Edit Assignment" : "Add New Assignment"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              placeholder="Enter assignment title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              placeholder="Enter brief description"
              rows="3"
            ></textarea>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
