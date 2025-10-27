import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/http";
import toast from "react-hot-toast";
import AssignmentForm from "./AssignmentForm";
import SubmitAssignmentModal from "../components/SubmitAssignmentModal";
import AssignmentSubmissionsModal from "../components/AssignmentSubmissionsModal";
import UploadResourceModal from "../components/UploadResourceModal";
import PerformanceTab from "../components/PerformanceTab";

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [tab, setTab] = useState("overview");
  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [students, setStudents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchCourseData = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, assignRes, resRes, studentRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/assignments`),
        api.get(`/courses/${courseId}/resources`),
        api.get(`/courses/${courseId}/students`),
      ]);
      setCourse(courseRes.data);
      setAssignments(assignRes.data || []);
      setResources(resRes.data || []);
      setStudents(studentRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 animate-pulse">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-indigo-700">{course.title}</h1>
        <p className="text-gray-500">{course.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          "overview",
          "assignments",
          "resources",
          "students",
          "performance",
        ].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
              tab === t
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-indigo-600"
            }`}
            aria-label={`${t} tab`}
            aria-selected={tab === t}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tab === "overview" && (
          <div>
            <h2 className="text-lg font-semibold text-indigo-600 mb-2">
              Course Overview
            </h2>
            <p className="text-gray-600 mb-4">
              This course is taught by <strong>{course.teacher_name}</strong>{" "}
              and has <strong>{students.length}</strong> enrolled students.
            </p>
            <ul className="list-disc ml-6 text-gray-600">
              <li>Start Date: {course.start_date || "N/A"}</li>
              <li>End Date: {course.end_date || "N/A"}</li>
            </ul>
          </div>
        )}

        {tab === "assignments" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-indigo-600">
                Assignments
              </h2>
              {user?.role === "teacher" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700"
                >
                  + Add Assignment
                </button>
              )}
            </div>

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
                      {user?.role === "student" && (
                        <th className="py-2 px-3 text-left">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr
                        key={a.assignment_id}
                        className="border-b hover:bg-indigo-50"
                      >
                        <td className="py-2 px-3">{a.title}</td>
                        <td className="py-2 px-3">
                          {a.due_date
                            ? new Date(a.due_date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-2 px-3">
                          {user?.role === "teacher"
                            ? `${a.submissions_pending} pending`
                            : a.status || "Not Submitted"}
                        </td>

                        {/* Student submit button */}
                        {user?.role === "student" && (
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

                        {/* Teacher view submissions button */}
                        {user?.role === "teacher" && (
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

            {showForm && (
              <AssignmentForm
                courseId={course.course_id}
                onClose={() => setShowForm(false)}
                onSuccess={fetchCourseData}
              />
            )}

            {selectedAssignment && user?.role === "student" && (
              <SubmitAssignmentModal
                assignment={selectedAssignment}
                courseId={course.course_id}
                onClose={() => setSelectedAssignment(null)}
                onSuccess={fetchCourseData}
              />
            )}

            {selectedAssignment && user?.role === "teacher" && (
              <AssignmentSubmissionsModal
                assignment={selectedAssignment}
                courseId={course.course_id}
                onClose={() => setSelectedAssignment(null)}
                onSuccess={fetchCourseData}
              />
            )}
          </div>
        )}

        {tab === "resources" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-indigo-600">
                Resources
              </h2>
              {user?.role === "teacher" && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700"
                >
                  + Upload Resource
                </button>
              )}
            </div>

            {resources.length === 0 ? (
              <p className="text-gray-500 italic">No resources uploaded yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {resources.map((r) => (
                  <li
                    key={r.resource_id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-gray-800 font-medium">{r.title}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded on:{" "}
                        {r.uploaded_at
                          ? new Date(r.uploaded_at).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      View / Download
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {showUploadModal && (
              <UploadResourceModal
                courseId={course.course_id}
                onClose={() => setShowUploadModal(false)}
                onSuccess={fetchCourseData}
              />
            )}
          </div>
        )}

        {tab === "students" && (
          <div>
            <h2 className="text-lg font-semibold text-indigo-600 mb-3">
              Enrolled Students
            </h2>
            {students.length === 0 ? (
              <p className="text-gray-500 italic">No students enrolled yet.</p>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="py-2 px-3 text-left">Name</th>
                      <th className="py-2 px-3 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr
                        key={s.student_id}
                        className="border-b hover:bg-indigo-50"
                      >
                        <td className="py-2 px-3">{s.name}</td>
                        <td className="py-2 px-3">{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "performance" && user?.role === "teacher" && (
          <PerformanceTab courseId={courseId} />
        )}

        {tab === "performance" && user?.role !== "teacher" && (
          <div>
            <p className="text-gray-500 italic">
              Performance data is only available to teachers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
