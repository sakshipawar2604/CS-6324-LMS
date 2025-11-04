import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../services/http";
import toast from "react-hot-toast";

import CourseTabs from "../components/course/CourseTabs";
import CourseOverview from "../components/course/CourseOverview";
import CourseAssignments from "../components/course/CourseAssignments";
import CourseModules from "../components/course/CourseModules.jsx";
import CourseStudents from "../components/course/CourseStudents";
import CoursePerformance from "../components/course/CoursePerformance";

export default function CourseDetails() {
  const { courseId } = useParams();
  const [tab, setTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [modules, setResources] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);
  const role = currentUser?.role;
  const studentId = currentUser?.userId || "STU001";

  const fetchCourseData = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, allAssignmentsRes, resRes, enrollRes] =
        await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/assignments`).catch(() => ({ data: [] })), // fetch all, filter below
          api.get(`/courses/${courseId}/modules`).catch(() => ({ data: [] })),
          api.get(`/enrollments`).catch(() => ({ data: [] })),
        ]);

      // === COURSE INFO ===
      setCourse(courseRes.data);

      // === FILTER ASSIGNMENTS ===
      const allAssignments = allAssignmentsRes.data || [];
      const courseAssignments = allAssignments.filter(
        (a) => a.course?.courseId === Number(courseId)
      );
      setAssignments(courseAssignments);

      // === RESOURCES (optional, depends on API availability) ===
      setResources(resRes.data || []);

      // === ENROLLMENTS -> STUDENTS ===
      const enrolledStudents =
        enrollRes.data
          ?.filter((e) => e.course?.courseId === Number(courseId))
          ?.map((e) => e.student) || [];

      const uniqueStudents = Array.from(
        new Map(enrolledStudents.map((s) => [s.userId, s])).values()
      );

      setStudents(uniqueStudents);
    } catch (err) {
      console.error("Failed to load course data", err);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 animate-pulse">Loading course details...</p>
      </div>
    );

  if (!course)
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Course not found.</p>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-indigo-700">{course.title}</h1>
      </div>

      <CourseTabs tab={tab} setTab={setTab} />

      <div className="mt-4">
        {tab === "overview" && (
          <CourseOverview course={course} students={students} />
        )}
        {tab === "assignments" && (
          <CourseAssignments
            role={role}
            courseId={courseId}
            assignments={assignments}
            refresh={fetchCourseData}
          />
        )}
        {tab === "modules" && (
          <CourseModules
            role={role}
            courseId={courseId}
            modules={modules}
            refresh={fetchCourseData}
          />
        )}
        {tab === "students" && <CourseStudents students={students} />}
        {tab === "performance" && (
          <CoursePerformance
            role={role}
            courseId={courseId}
            studentId={studentId}
          />
        )}
      </div>
    </div>
  );
}
