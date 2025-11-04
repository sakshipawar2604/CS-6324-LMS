import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/http";

export default function SubmitAssignmentModal({
  assignment,
  courseId,
  onClose,
  onSuccess,
}) {
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);

  // Get current student info
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId =
    user?.user?.userId || user?.userId || user?.id || user?.user_id;

  // Check if the student already submitted for this assignment
  const fetchExistingSubmission = async () => {
    try {
      const res = await api.get("/submissions");
      const all = res.data || [];
      const found = all.find(
        (s) =>
          s.assignment?.assignmentId === assignment.assignmentId &&
          s.student?.userId === studentId
      );
      if (found) {
        setExistingSubmission(found);
        setSubmissionUrl(found.submissionUrl || "");
      }
    } catch (err) {
      console.error("Failed to fetch existing submission", err);
    }
  };

  useEffect(() => {
    fetchExistingSubmission();
  }, []);

  // Handle create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionUrl.trim()) {
      toast.error("Please enter a valid submission URL");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        assignment: { assignmentId: assignment.assignmentId },
        student: { userId: studentId },
        submissionUrl: submissionUrl.trim(),
      };

      if (existingSubmission) {
        await api.put(
          `/submissions/${existingSubmission.submissionId}`,
          payload
        );
        toast.success("Submission updated successfully!");
      } else {
        await api.post("/submissions", payload);
        toast.success("Assignment submitted successfully!");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save submission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          {existingSubmission ? "Update Submission" : "Submit Assignment"} -{" "}
          {assignment.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Submission URL field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submission URL (e.g., Google Drive / GitHub / PDF link)
            </label>
            <input
              type="url"
              placeholder="http://domain/submission.pdf"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              required
            />
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
