import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/http";

export default function UploadResourceModal({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const allowed = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(selected.type)) {
      toast.error("Only PDF, PPT, or DOC files are allowed");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error("Please enter title and select a file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("course_id", courseId);
      formData.append("title", title);
      formData.append("file", file);

      await api.post(`/courses/${courseId}/resources`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Resource uploaded successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload resource");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Upload Course Resource
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
              placeholder="Enter file title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select File (PDF / PPT / DOC)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              required
            />
            {file && (
              <p className="mt-1 text-sm text-gray-500">📄 {file.name}</p>
            )}
          </div>

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
