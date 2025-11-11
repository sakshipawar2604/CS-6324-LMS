import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../../services/http";

export default function EditResourceModal({ resource, onClose, onSuccess }) {
  const [title, setTitle] = useState(resource.title || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extract existing IDs safely
  const courseId = resource.course?.courseId || 1;
  const moduleId = resource.module?.moduleId || 1;
  const uploadedBy =
    resource.uploadedBy?.userId ||
    JSON.parse(localStorage.getItem("user"))?.userId ||
    2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("moduleId", moduleId);
      formData.append("uploadedBy", uploadedBy);
      formData.append("title", title.trim());
      if (file) formData.append("file", file);

      toast.loading("Updating resource...", { id: "update" });

      await api.put(`/resources/${resource.resourceId}`, formData);

      toast.success("Resource updated successfully!", { id: "update" });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update resource", { id: "update" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Edit Resource
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
              required
            />
          </div>

          {/* File Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              File
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setFile(file);
                }
              }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <input
                type="file"
                id="fileUpload"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="fileUpload" className="cursor-pointer block">
                {file ? (
                  <span className="text-sm text-indigo-600 font-medium">
                    {file.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-600">
                    Click or drag & drop to upload file
                  </span>
                )}
              </label>
            </div>
            {file && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                Click to change file
              </p>
            )}
            {file && (resource.fileKey || resource.fileUrl) && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                ⚠️ Uploading a new file will replace the current file.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
