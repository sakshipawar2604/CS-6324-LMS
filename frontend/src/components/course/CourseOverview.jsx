import { Users, BookOpen, CalendarDays } from "lucide-react";

export default function CourseOverview({ course, students }) {
  const teacherName = course.createdBy?.fullName || "Unknown Instructor";
  const enrolledCount = students.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-indigo-600 mb-3">
          Course Overview
        </h2>
      </div>

      {/* Info Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <BookOpen className="text-indigo-600 w-5 h-5 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">Instructor:</span>{" "}
              {teacherName}
            </div>
          </li>

          <li className="flex items-start gap-3">
            <Users className="text-indigo-600 w-5 h-5 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">
                Enrolled Students:
              </span>{" "}
              {enrolledCount} {enrolledCount === 1 ? "student" : "students"}
            </div>
          </li>
        </ul>
      </div>

      {/* Description Card */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
        <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-700" />
          Description
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {course.description || "No description provided for this course."}
        </p>
      </div>
    </div>
  );
}
