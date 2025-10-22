import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/http";
import toast from "react-hot-toast";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user?.user?.user_id) return;

    const fetchAssignedCourses = async () => {
      setLoading(true);
      try {
        const teacherId = user.user.user_id;
        // 🧠 backend joins "courses" + "users" table to get teacher's courses
        const res = await api.get(`/courses?teacherId=${teacherId}`);
        setCourses(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load assigned courses");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 animate-pulse">
          Loading assigned courses...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-indigo-700">
          Teacher Dashboard
        </h1>
        <p className="text-gray-500">
          Overview of the courses you are currently teaching
        </p>
      </div>

      {/* Assigned Courses */}
      {courses.length === 0 ? (
        <p className="text-gray-500 italic">
          You are not assigned to any courses yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-indigo-100 hover:border-indigo-300 transition-transform hover:scale-[1.02] cursor-pointer overflow-hidden"
              onClick={() => navigate(`/teacher/courses/${course.course_id}`)}
            >
              {/* top color band */}
              <div className="h-2 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-indigo-700 group-hover:text-indigo-800">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1 mb-3">
                  {course.description || "No description provided"}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <p>Course ID: {course.course_id}</p>
                  <p>
                    Students:{" "}
                    <span className="font-medium text-gray-700">
                      {course.studentCount ?? "-"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
