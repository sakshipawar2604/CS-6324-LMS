import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/http";

export default function AssignmentForm({
  courseId,
  existing,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    file: null,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (existing) {
      // Format dueDate for date input (YYYY-MM-DD format)
      let formattedDueDate = "";
      if (existing.dueDate) {
        // Extract date part only (remove time if present)
        const dateStr = existing.dueDate.split("T")[0];
        formattedDueDate = dateStr;
      }
      setForm({
        title: existing.title || "",
        description: existing.description || "",
        dueDate: formattedDueDate,
        file: null,
      });
    }
  }, [existing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.title || !form.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      formData.append("dueDate", form.dueDate);
      if (form.file) formData.append("file", form.file); // from file upload

      toast.loading(existing ? "Updating..." : "Creating...", { id: "save" });

      if (existing) {
        await api.put(`/assignments/${existing.assignmentId}`, formData);
        toast.success("Assignment updated successfully!", { id: "save" });
      } else {
        await api.post("/assignments", formData);
        toast.success("Assignment created successfully!", { id: "save" });
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save assignment", { id: "save" });
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/assignments/${existing.assignmentId}`);
      toast.success("Assignment deleted successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete assignment");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          {existing ? "Edit Assignment" : "Create Assignment"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Title{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              aria-required="true"
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="2"
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Due Date{" "}
              <span className="text-red-500" aria-label="required">
                *
              </span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              required
              aria-required="true"
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">File</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) setForm((prev) => ({ ...prev, file }));
              }}
              className="border-2 border-dashed rounded-lg w-full p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <input
                type="file"
                id="fileUpload"
                accept=".pdf,.doc,.docx,image/*"
                onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                className="hidden"
              />
              <label
                htmlFor="fileUpload"
                className="cursor-pointer text-indigo-600 font-medium"
              >
                {form.file
                  ? `Selected: ${form.file.name}`
                  : existing && (existing.fileKey || existing.fileUrl)
                  ? "Click or drag & drop a new file to replace existing one"
                  : "Click or drag & drop a file here"}
              </label>
            </div>

            {/* Show replacement message when editing and a new file is selected */}
            {existing &&
              (existing.fileKey || existing.fileUrl) &&
              form.file && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>
                    Uploading a new file will replace the current file:{" "}
                    <span className="font-medium">
                      {(existing.fileKey || existing.fileUrl)?.split("/").pop()}
                    </span>
                  </span>
                </p>
              )}
          </div>

          <div className="flex justify-between items-center pt-4">
            {existing && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            )}

            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {existing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
            <div className="bg-white rounded-lg shadow-lg p-5 w-80 text-center">
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to delete{" "}
                <strong>{existing.title}</strong>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
