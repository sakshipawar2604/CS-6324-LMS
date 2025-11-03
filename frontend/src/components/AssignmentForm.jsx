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
    fileUrl: existing?.fileUrl || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.dueDate) {
      toast.error("All fields except file URL are required");
      return;
    }

    const payload = {
      title: formData.title,
      course: { courseId: Number(courseId) },
      description: formData.description,
      dueDate: formData.dueDate,
      fileUrl: formData.fileUrl || "",
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

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await api.delete(`/assignments/${existing.assignmentId}`);
      toast.success("Assignment deleted");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete assignment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">
          {isEdit ? "Edit Assignment" : "Add New Assignment"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter assignment title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter assignment description"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              File URL (optional)
            </label>
            <input
              type="url"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              placeholder="http://example.com/file.pdf"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex justify-between pt-4">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                {isEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
