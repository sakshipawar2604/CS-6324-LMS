import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/http";
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
                <th className="py-3 px-4 text-left w-[40%]">Title</th>
                <th className="py-3 px-4 text-left w-[25%]">Due Date</th>
                <th className="py-3 px-4 text-left w-[35%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
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
                    {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    {role === "teacher" ? (
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setViewingSubmissions(a)}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View Submissions
                        </button>
                        <button
                          onClick={() => {
                            setEditAssignment(a);
                            setShowForm(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedAssignment(a)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-600"
                      >
                        Submit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
