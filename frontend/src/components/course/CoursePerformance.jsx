import PerformanceTab from "../PerformanceTab";
import CoursePerformanceStudent from "../CoursePerformanceStudent";

export default function CoursePerformance({ role, courseId, studentId }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-indigo-600 mb-3">
        Performance
      </h2>

      {role === "teacher" && <PerformanceTab courseId={courseId} role={role} />}

      {role === "student" && (
        <CoursePerformanceStudent
          courseId={courseId}
          studentId={studentId}
          role={role}
        />
      )}

      {!["teacher", "student"].includes(role) && (
        <p className="text-gray-500 italic">
          Performance data not available for this role.
        </p>
      )}
    </div>
  );
}
