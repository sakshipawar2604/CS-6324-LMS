import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../../services/http"; // ✅ make sure this path exists

export default function UploadResourceModal({
  moduleId,
  courseId,
  onClose,
  onSuccess,
}) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch the logged-in teacher’s info
  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.userId || user?.user?.userId;

  // 🔹 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !fileUrl.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // ✅ Payload exactly as backend expects
      const payload = {
        title: title.trim(),
        fileUrl: fileUrl.trim(),
        course: { courseId },
        module: { moduleId },
        uploadedBy: { userId: teacherId },
      };

      // ✅ POST to backend
      const res = await api.post("/resources", payload);

      if (res.status === 201 || res.status === 200) {
        toast.success("Resource uploaded successfully!");
        onSuccess(); // refresh module list
        onClose(); // close modal
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Error uploading resource:", err);
      if (err.response?.status === 403) {
        toast.error("Unauthorized: Only teachers can upload resources");
      } else if (err.response?.status === 400) {
        toast.error("Invalid request format");
      } else {
        toast.error("Failed to upload resource");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 UI
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Upload Resource
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resource Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter resource title"
              required
            />
          </div>

          {/* File URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File URL (Direct link to PDF, DOC, etc.)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              placeholder="https://example.com/resource.pdf"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
