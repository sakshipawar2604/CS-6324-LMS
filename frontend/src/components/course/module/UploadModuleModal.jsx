import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../../services/http"; // ✅ ensure correct import path

export default function UploadModuleModal({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a module title");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        course: { courseId },
      };

      // 🔹 Make backend API call
      await api.post("/modules", payload);

      toast.success("Module uploaded successfully!");
      onSuccess(); // refresh modules list
      onClose(); // close modal
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload module");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Upload Module
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div>
            <label className="block text-sm text-gray-700">Module Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter module title"
              required
            />
          </div>

          {/* Optional Description Field */}
          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 text-sm"
              placeholder="Add a short module description"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
