export default function CourseOverview({ course, students }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-indigo-600 mb-3">
        Course Overview
      </h2>

      <p className="text-gray-600 mb-4 leading-relaxed">
        This course is taught by{" "}
        <strong>{course.createdBy?.fullName || "Unknown"}</strong> and currently
        has <strong>{students.length}</strong> enrolled{" "}
        {students.length === 1 ? "student" : "students"}.
      </p>

      <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100">
        <h3 className="text-md font-medium text-indigo-700 mb-2">
          Description
        </h3>
        <p className="text-gray-700 whitespace-pre-line">
          {course.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}
