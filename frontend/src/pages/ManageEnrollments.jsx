import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";
import AddEnrollmentModal from "../components/AddEnrollmentModal";

export default function ManageEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/admin/enrollments");
      setEnrollments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return (
    <div className="space-y-8" id="main-content">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">
            Manage Enrollments
          </h1>
          <p className="text-gray-600 text-sm">
            View and add student enrollments
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Add a new enrollment"
        >
          + Add Enrollment
        </button>
      </div>

      {/* Enrollment Table */}
      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading enrollments...</p>
      ) : enrollments.length === 0 ? (
        <p className="text-gray-400 italic">No enrollments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="min-w-full bg-white shadow rounded-lg overflow-hidden"
            role="table"
            aria-label="List of enrollments"
          >
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Enrollment ID</th>
                <th className="py-3 px-4 text-left">Student Name</th>
                <th className="py-3 px-4 text-left">Course</th>
                <th className="py-3 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr
                  key={e.id}
                  className="border-b hover:bg-indigo-50 focus-within:bg-indigo-100"
                  tabIndex="0"
                >
                  <td className="py-2 px-4">{e.id}</td>
                  <td className="py-2 px-4">{e.student_name}</td>
                  <td className="py-2 px-4">{e.course_title}</td>
                  <td className="py-2 px-4">{e.enrollment_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddEnrollmentModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchEnrollments}
        />
      )}
    </div>
  );
}
