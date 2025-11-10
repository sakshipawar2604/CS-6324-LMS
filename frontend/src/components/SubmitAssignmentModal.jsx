import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/http";
import { getFileViewerUrl } from "../utils/s3Utils";

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
                : "Click or drag & drop a new file to replace existing one"}
            </label>
            {/* Show existing file if no new file chosen */}
            {existingSubmission?.submissionUrl && !file && (
              <p className="text-xs text-gray-500 mt-1">
                Current:{" "}
                <a
                  href={getFileViewerUrl(existingSubmission.submissionUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline"
                >
                  {existingSubmission.submissionUrl.split("/").pop()}
                </a>
              </p>
            )}
          </div>

          {/* Existing submission info */}
          {existingSubmission && (
            <p className="text-sm text-gray-600 text-center">
              You’ve already submitted once. Uploading again will{" "}
              <span className="font-semibold text-indigo-600">replace</span>{" "}
              your current file.
            </p>
          )}

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
