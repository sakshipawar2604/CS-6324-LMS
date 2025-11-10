import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/http";
import { getFileViewerUrl } from "../../utils/s3Utils";

export default function AssignmentSubmissions({ assignment, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null); // current submission being graded
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  // Fetch all submissions, then filter by assignment + course
  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/submissions");
      const all = res.data || [];

      const filtered = all.filter(
        (s) =>
          s.assignment?.assignmentId === assignment.assignmentId &&
          s.assignment?.course?.courseId === assignment.course?.courseId
      );

      setSubmissions(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (submission) => {
    try {
      const numericGrade = Number(grade);
      if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
        toast.error("Grade must be between 0 and 100");
        return;
      }

      const formData = new FormData();
      formData.append("userId", submission.student.userId);
      formData.append("assignmentId", submission.assignment.assignmentId);
      formData.append("feedback", feedback || "");
      formData.append("grades", numericGrade);

      toast.loading("Updating grade...", { id: "grade" });

      await api.put(
        `/submissions/forTeacher/${submission.submissionId}`,
        formData
      );

      toast.success("Grade updated successfully!", { id: "grade" });
      setGrading(null);
      setGrade("");
      setFeedback("");
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update grade", { id: "grade" });
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center py-6">
        <p className="text-gray-500 animate-pulse">Loading submissions...</p>
      </div>
    );

  return (
    <div className="mt-6 bg-white rounded-xl shadow p-6 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-indigo-700">
          Submissions for “{assignment.title}”
        </h2>
        <button onClick={onBack} className="text-sm text-indigo-600">
          ← Back to Assignments
        </button>
      </div>

      {/* Table */}
      {submissions.length === 0 ? (
        <p className="text-gray-500 italic">No submissions yet.</p>
      ) : (
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Submitted At</th>
              <th className="px-4 py-2 text-left">File</th>
              <th className="px-4 py-2 text-left">Grade</th>
              <th className="px-4 py-2 text-left">Feedback</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr
                key={s.submissionId}
                className="border-b hover:bg-indigo-50 transition"
              >
                <td className="px-4 py-2">{s.student?.fullName}</td>
                <td className="px-4 py-2">
                  {s.submittedAt
                    ? new Date(s.submittedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-2">
                  {s.submissionUrl ? (
                    <a
                      href={getFileViewerUrl(s.submissionUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      View File
                    </a>
                  ) : (
                    <span className="text-gray-400">No file</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {s.grade != null ? `${s.grade}/100` : "—"}
                </td>
                <td className="px-4 py-2">{s.feedback || "—"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => {
                      setGrading(s);
                      setGrade(s.grade || "");
                      setFeedback(s.feedback || "");
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    {s.grade ? "Edit" : "Grade"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Grading Modal */}
      {grading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">
              Grade Submission - {grading.student?.fullName}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGradeSubmit(grading);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Grade (0–100)
                </label>
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  max="100"
                  className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="3"
                  className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Write feedback..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setGrading(null)}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
