import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../../services/http";

export default function UploadResourceModal({
  moduleId,
  courseId,
  onClose,
  onSuccess,
}) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Logged-in teacher info
  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.userId || user?.user?.userId;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !file) {
      toast.error("Please provide both title and file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("moduleId", moduleId);
      formData.append("uploadedBy", teacherId);
      formData.append("title", title.trim());
      formData.append("file", file);

      toast.loading("Uploading resource...", { id: "upload" });

      const res = await api.post("/resources", formData);

      if (res.status === 201 || res.status === 200) {
        toast.success("Resource uploaded successfully!", { id: "upload" });
        onSuccess();
        onClose();
      } else {
        toast.error("Unexpected response from server", { id: "upload" });
      }
    } catch (err) {
      console.error("Error uploading resource:", err);
      if (err.response?.status === 403) {
        toast.error("Unauthorized: Only teachers can upload", { id: "upload" });
      } else if (err.response?.status === 400) {
        toast.error("Invalid request format", { id: "upload" });
      } else {
        toast.error("Failed to upload resource", { id: "upload" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Upload Resource
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
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

          {/* Drag & Drop File Upload */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) setFile(droppedFile);
            }}
            className="border-2 border-dashed rounded-lg w-full p-5 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <input
              type="file"
              id="fileUpload"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer text-indigo-600 font-medium"
            >
              {file
                ? `Selected: ${file.name}`
                : "Click or drag & drop a file here"}
            </label>
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
