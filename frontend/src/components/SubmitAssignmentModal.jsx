import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/http";
import { getFileViewerUrl } from "../utils/s3Utils";
import { FileText, ExternalLink } from "lucide-react";

export default function SubmitAssignmentModal({
  assignment,
  courseId,
  onClose,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId =
    user?.user?.userId || user?.userId || user?.id || user?.user_id;

  // Fetch if the student already submitted
  const fetchExistingSubmission = async () => {
    try {
      const res = await api.get("/submissions");
      const all = res.data || [];
      const found = all.find(
        (s) =>
          s.assignment?.assignmentId === assignment.assignmentId &&
          s.student?.userId === userId
      );
      if (found) setExistingSubmission(found);
    } catch (err) {
      console.error("Failed to fetch existing submission", err);
    }
  };

  useEffect(() => {
    fetchExistingSubmission();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to submit");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("assignmentId", assignment.assignmentId);
      formData.append("file", file);

      toast.loading(existingSubmission ? "Updating..." : "Submitting...", {
        id: "submit",
      });

      if (existingSubmission) {
        await api.put(
          `/submissions/forStudent/${existingSubmission.submissionId}`,
          formData
        );
        toast.success("Submission updated successfully!", { id: "submit" });
      } else {
        await api.post("/submissions", formData);
        toast.success("Assignment submitted successfully!", { id: "submit" });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save submission", { id: "submit" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          {existingSubmission ? "Update Submission" : "Submit Assignment"} –{" "}
          {assignment.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show current file if exists and no new file selected */}
          {existingSubmission?.submissionUrl && !file && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">
                    Current submission:
                  </span>
                  <a
                    href={getFileViewerUrl(existingSubmission.submissionUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                  >
                    {existingSubmission.submissionUrl.split("/").pop()}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Drag & Drop File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File
            </label>
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
                  : existingSubmission?.submissionUrl
                  ? "Click or drag & drop a new file to replace existing one"
                  : "Click or drag & drop a file here"}
              </label>
            </div>

            {/* Show replacement message when a new file is selected */}
            {existingSubmission?.submissionUrl && file && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>
                  Uploading a new file will replace the current submission:{" "}
                  <span className="font-medium">
                    {existingSubmission.submissionUrl.split("/").pop()}
                  </span>
                </span>
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {loading
                  ? "Saving..."
                  : existingSubmission
                  ? "Update"
                  : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
