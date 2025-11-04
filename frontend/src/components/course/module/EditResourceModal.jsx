import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../../services/http";

export default function EditResourceModal({ resource, onClose, onSuccess }) {
  const [title, setTitle] = useState(resource.title || "");
  const [fileUrl, setFileUrl] = useState(resource.fileUrl || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !fileUrl) {
      toast.error("Please fill out all fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        fileUrl,
        course: { courseId: resource.course?.courseId || 1 },
        module: { moduleId: resource.module?.moduleId || 1 },
        uploadedBy: { userId: resource.uploadedBy?.userId || 2 },
      };

      await api.put(`/resources/${resource.resourceId}`, payload);
      toast.success("Resource updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update resource");
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              File URL
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="http://domain/file.pdf"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
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
