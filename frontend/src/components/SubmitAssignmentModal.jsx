import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/http";

export default function SubmitAssignmentModal({
  assignment,
  courseId,
  onClose,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!["application/pdf", "application/zip"].includes(selected.type)) {
      toast.error("Only PDF or ZIP files are allowed");
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please attach your submission file");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("assignment_id", assignment.assignment_id);
      formData.append("course_id", courseId);
      formData.append("notes", notes);
      formData.append("file", file);

      await api.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Assignment submitted successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Submit Assignment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write any comments or clarifications..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload File (PDF or ZIP)
            </label>
            <input
              type="file"
              accept=".pdf,.zip"
              onChange={handleFileChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
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
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
