import { useState } from "react";
import AssignmentForm from "../AssignmentForm";
import SubmitAssignmentModal from "../SubmitAssignmentModal";
import AssignmentSubmissionsModal from "../AssignmentSubmissionsModal";

export default function CourseAssignments({
  role,
  courseId,
  assignments,
  refresh,
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-indigo-600">Assignments</h2>
        {role === "teacher" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700"
          >
            + Add Assignment
          </button>
        )}
      </div>

      {/* Table */}
      {assignments.length === 0 ? (
        <p className="text-gray-500 italic">No assignments yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-2 px-3 text-left">Title</th>
                <th className="py-2 px-3 text-left">Due Date</th>
                <th className="py-2 px-3 text-left">Status</th>
                {(role === "teacher" || role === "student") && (
                  <th className="py-2 px-3 text-left">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr
                  key={a.assignment_id || a.assignmentId}
                  className="border-b hover:bg-indigo-50 transition"
                >
                  <td className="py-2 px-3">{a.title}</td>
                  <td className="py-2 px-3">
                    {a.due_date || a.dueDate
                      ? new Date(a.due_date || a.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-2 px-3">
                    {role === "teacher"
                      ? `${a.submissions_pending || 0} pending`
                      : a.status || "Not Submitted"}
                  </td>

                  {/* Student Submit Button */}
                  {role === "student" && (
                    <td className="py-2 px-3 text-right">
                      {!a.status || a.status === "Not Submitted" ? (
                        <button
                          onClick={() => setSelectedAssignment(a)}
                          className="bg-indigo-500 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-600"
                        >
                          Submit
                        </button>
                      ) : (
                        <span className="text-green-600 text-xs">
                          ✅ Submitted
                        </span>
                      )}
                    </td>
                  )}

                  {/* Teacher View Submissions */}
                  {role === "teacher" && (
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => setSelectedAssignment(a)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-600"
                      >
                        View Submissions
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <AssignmentForm
          courseId={courseId}
          onClose={() => setShowForm(false)}
          onSuccess={refresh}
        />
      )}

      {selectedAssignment && role === "student" && (
        <SubmitAssignmentModal
          assignment={selectedAssignment}
          courseId={courseId}
          onClose={() => setSelectedAssignment(null)}
          onSuccess={refresh}
        />
      )}

      {selectedAssignment && role === "teacher" && (
        <AssignmentSubmissionsModal
          assignment={selectedAssignment}
          courseId={courseId}
          onClose={() => setSelectedAssignment(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
