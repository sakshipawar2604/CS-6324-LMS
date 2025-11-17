import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../../services/http";
import { getFileViewerUrl } from "../../utils/s3Utils";
import AssignmentForm from "../AssignmentForm";
import SubmitAssignmentModal from "../SubmitAssignmentModal";
import AssignmentSubmissions from "./AssignmentSubmissions";

export default function CourseAssignments({
  role,
  courseId,
  assignments,
  refresh,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Get current user ID
  const userId = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.userId || user?.user?.userId || user?.id || user?.user_id;
  }, []);

  // Fetch submissions for the current student
  useEffect(() => {
    if (role === "student" && userId && assignments.length > 0) {
      const fetchSubmissions = async () => {
        try {
          const res = await api.get("/submissions");
          const allSubmissions = res.data || [];
          // Filter submissions for current student and this course's assignments
          const assignmentIds = assignments.map((a) => a.assignmentId);
          const studentSubmissions = allSubmissions.filter(
            (s) =>
              s.student?.userId === userId &&
              assignmentIds.includes(s.assignment?.assignmentId)
          );
          setSubmissions(studentSubmissions);
        } catch (err) {
          console.error("Failed to fetch submissions", err);
        }
      };
      fetchSubmissions();
    } else if (role === "student" && assignments.length === 0) {
      // Clear submissions if no assignments
      setSubmissions([]);
    }
  }, [role, userId, assignments]);

  // Create a map of assignmentId -> submission for quick lookup
  const submissionMap = useMemo(() => {
    const map = new Map();
    submissions.forEach((s) => {
      if (s.assignment?.assignmentId) {
        map.set(s.assignment.assignmentId, s);
      }
    });
    return map;
  }, [submissions]);

  // Helper function to get grade color
  const getGradeColor = (grade) => {
    if (grade == null) return "text-gray-600";
    const gradeNum = Number(grade);
    if (isNaN(gradeNum)) return "text-gray-600";
    if (gradeNum >= 90) return "text-green-700 font-semibold"; // Excellent (A)
    if (gradeNum >= 75) return "text-yellow-600 font-semibold"; // Average (C)
    return "text-red-600 font-semibold"; // Low (F/D)
  };

  const handleViewAssignment = (assignment) => {
    const fileKey = assignment.fileKey || assignment.fileUrl || assignment.file;
    if (!fileKey) {
      toast.error("No file attached for this assignment");
      return;
    }

    // Use S3 utility to construct the viewer URL (opens in browser)
    const viewerUrl = getFileViewerUrl(fileKey);

    if (!viewerUrl) {
      toast.error("Unable to access assignment file");
      return;
    }

    // Open file in new tab for viewing
    window.open(viewerUrl, "_blank", "noopener,noreferrer");
  };

  if (viewingSubmissions) {
    return (
      <AssignmentSubmissions
        assignment={viewingSubmissions}
        onBack={() => setViewingSubmissions(null)}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-indigo-600">Assignments</h2>
        {role === "teacher" && (
          <button
            onClick={() => {
              setEditAssignment(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            + Add Assignment
          </button>
        )}
      </div>

      {/* Table */}
      {assignments.length === 0 ? (
        <p className="text-gray-500 italic">No assignments yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left w-[25%]">Title</th>
                <th className="py-3 px-4 text-left w-[15%]">Due Date</th>
                {role === "student" && (
                  <>
                    <th className="py-3 px-4 text-left w-[15%]">Grade</th>
                    <th className="py-3 px-4 text-left w-[20%]">Feedback</th>
                  </>
                )}
                <th className="py-3 px-4 text-left w-[25%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const submission = submissionMap.get(a.assignmentId);
                return (
                  <tr
                    key={a.assignmentId}
                    className="border-b hover:bg-indigo-50 transition"
                  >
                    {/* Title */}
                    <td className="py-3 px-4 text-indigo-700 font-medium">
                      {a.title}
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 text-gray-700">
                      {a.dueDate
                        ? (() => {
                            const dateStr = a.dueDate.split("T")[0];
                            const [year, month, day] = dateStr.split("-");
                            return `${month}/${day}/${year}`; // US format: MM/DD/YYYY
                          })()
                        : "—"}
                    </td>

                    {/* Grade - Only for students */}
                    {role === "student" && (
                      <td className="py-3 px-4">
                        {submission && submission.grade != null ? (
                          <span
                            className={`font-semibold ${getGradeColor(
                              submission.grade
                            )}`}
                          >
                            {submission.grade}/100
                          </span>
                        ) : submission ? (
                          <span className="text-gray-400 italic">
                            Not graded yet
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Not submitted
                          </span>
                        )}
                      </td>
                    )}

                    {/* Feedback - Only for students */}
                    {role === "student" && (
                      <td className="py-3 px-4 text-gray-600">
                        {submission?.feedback || "-"}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="py-3 px-4">
                      {/* View Assignment - visible to everyone */}

                      {role === "teacher" ? (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleViewAssignment(a)}
                            className="text-sm font-medium text-green-600 hover:text-green-800"
                          >
                            View Assignment
                          </button>

                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => setViewingSubmissions(a)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            View Submissions
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => {
                              setEditAssignment(a);
                              setShowForm(true);
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleViewAssignment(a)}
                            className="text-sm font-medium text-green-600 hover:text-green-800"
                          >
                            View Assignment
                          </button>

                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => setSelectedAssignment(a)}
                            className="px-2 py-1 rounded-md text-sm hover:bg-indigo-200"
                          >
                            {submission
                              ? "Update Submission"
                              : "Add Submission"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Assignment Modal */}
      {showForm && (
        <AssignmentForm
          courseId={courseId}
          existing={editAssignment}
          onClose={() => {
            setShowForm(false);
            setEditAssignment(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditAssignment(null);
            refresh();
          }}
        />
      )}

      {/* Student Submission Modal */}
      {selectedAssignment && role === "student" && (
        <SubmitAssignmentModal
          assignment={selectedAssignment}
          courseId={courseId}
          onClose={() => setSelectedAssignment(null)}
          onSuccess={async () => {
            // Refresh submissions after submission
            if (userId && assignments.length > 0) {
              try {
                const res = await api.get("/submissions");
                const allSubmissions = res.data || [];
                const assignmentIds = assignments.map((a) => a.assignmentId);
                const studentSubmissions = allSubmissions.filter(
                  (s) =>
                    s.student?.userId === userId &&
                    assignmentIds.includes(s.assignment?.assignmentId)
                );
                setSubmissions(studentSubmissions);
              } catch (err) {
                console.error("Failed to refresh submissions", err);
              }
            }
            refresh();
          }}
        />
      )}
    </div>
  );
}
