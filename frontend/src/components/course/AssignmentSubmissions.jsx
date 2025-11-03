import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/http";

export default function AssignmentSubmissions({ assignment, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(
        `/assignments/${assignment.assignmentId}/submissions`
      );
      setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (submissionId) => {
    try {
      const numericGrade = Number(grade);
      if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
        toast.error("Grade must be between 0 and 100");
        return;
      }
      await api.post(`/submissions/${submissionId}/grade`, {
        grade: numericGrade,
        feedback,
      });
      toast.success("Grade submitted successfully!");
      setEditing(null);
      setGrade("");
      setFeedback("");
      fetchSubmissions();
    } catch (err) {
      toast.error("Failed to submit grade");
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
              <th className="px-4 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr
                key={s.submissionId || s.submission_id}
                className="border-b hover:bg-indigo-50 transition"
              >
                <td className="px-4 py-2">{s.studentName}</td>
                <td className="px-4 py-2">
                  {new Date(s.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <a
                    href={s.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    View File
                  </a>
                </td>
                <td className="px-4 py-2">
                  {s.grade != null ? `${s.grade}/100` : "—"}
                </td>
                <td className="px-4 py-2">{s.feedback || "—"}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => {
                      setEditing(s);
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

      {/* Inline Grading Form */}
      {editing && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-md font-semibold text-indigo-700 mb-2">
            Grade Submission - {editing.studentName}
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGradeSubmit(editing.submissionId);
            }}
            className="space-y-3"
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
                rows="2"
                className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Grade
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
