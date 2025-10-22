import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/http";

export default function AssignmentSubmissionsModal({ assignment, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(
        `/assignments/${assignment.assignment_id}/submissions`
      );
      setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGrade = async (submissionId, grade, feedback) => {
    try {
      await api.post(`/submissions/${submissionId}/grade`, { grade, feedback });
      toast.success("Grade submitted!");
      fetchSubmissions(); // refresh
    } catch (err) {
      toast.error("Failed to submit grade");
    } finally {
      setGrading(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Submissions for "{assignment.title}"
        </h2>

        <table className="min-w-full text-sm border">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-2 px-3 text-left">Student</th>
              <th className="py-2 px-3 text-left">Submitted At</th>
              <th className="py-2 px-3 text-left">File</th>
              <th className="py-2 px-3 text-left">Grade</th>
              <th className="py-2 px-3 text-left">Feedback</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.submission_id} className="border-b hover:bg-indigo-50">
                <td className="py-2 px-3">{s.student_name}</td>
                <td className="py-2 px-3">
                  {new Date(s.submitted_at).toLocaleDateString()}
                </td>
                <td className="py-2 px-3">
                  <a
                    href={s.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    View File
                  </a>
                </td>
                <td className="py-2 px-3">
                  {s.grade !== null && s.grade !== undefined
                    ? `${s.grade}/100`
                    : "-"}
                </td>
                <td className="py-2 px-3">{s.feedback || "-"}</td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => setGrading(s)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {s.grade ? "Edit" : "Grade"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>

      {/* Grade modal */}
      {grading && (
        <GradeModal
          submission={grading}
          onClose={() => setGrading(null)}
          onSave={handleGrade}
        />
      )}
    </div>
  );
}

function GradeModal({ submission, onClose, onSave }) {
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericGrade = Number(grade);

    // basic validation
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      toast.error("Grade must be a number between 0 and 100");
      return;
    }

    onSave(submission.submission_id, numericGrade, feedback);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          Grade Submission - {submission.student_name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Numeric Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grade (0–100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter numeric grade"
              required
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Feedback
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              rows="3"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write feedback here..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Save Grade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
