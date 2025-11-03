import { useState } from "react";
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
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);

  // when teacher clicks "View Submissions" we render the submissions view
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
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left w-40">Due Date</th>
                <th className="py-2 px-4 text-left w-44">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr
                  key={a.assignmentId || a.assignment_id}
                  className="border-b hover:bg-indigo-50 transition"
                >
                  {/* title */}
                  <td className="py-3 px-4 text-indigo-700 font-medium">
                    {a.title}
                  </td>

                  {/* due date */}
                  <td className="py-3 px-4 text-gray-700">
                    {a.dueDate || a.due_date
                      ? new Date(a.dueDate || a.due_date).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* action */}
                  <td className="py-3 px-4">
                    {role === "student" ? (
                      <button
                        onClick={() => setSelectedAssignment(a)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-600"
                      >
                        Submit
                      </button>
                    ) : (
                      <button
                        onClick={() => setViewingSubmissions(a)}
                        className="px-2 py-1 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        View Submissions
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* create/edit form */}
      {showForm && (
        <AssignmentForm
          courseId={courseId}
          onClose={() => setShowForm(false)}
          onSuccess={refresh}
        />
      )}

      {/* student submit modal */}
      {selectedAssignment && role === "student" && (
        <SubmitAssignmentModal
          assignment={selectedAssignment}
          courseId={courseId}
          onClose={() => setSelectedAssignment(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
