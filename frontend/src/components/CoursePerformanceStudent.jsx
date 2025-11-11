import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Loader2,
} from "lucide-react";
import AIRecommendations from "./AIRecommendations";

export default function CoursePerformanceStudent({ courseId, studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all assignments and submissions, then filter client-side
        const [assignmentsRes, submissionsRes] = await Promise.all([
          api.get(`/assignments`).catch(() => ({ data: [] })),
          api.get(`/submissions`).catch(() => ({ data: [] })),
        ]);

        const allAssignments = assignmentsRes.data || [];
        const allSubmissions = submissionsRes.data || [];

        // Filter assignments for this course
        const courseAssignments = allAssignments.filter(
          (a) => a.course?.courseId === Number(courseId)
        );

        // Filter submissions for this student
        const studentSubmissions = allSubmissions.filter(
          (s) => s.student?.userId === Number(studentId)
        );

        // Create a map of assignmentId -> submission for quick lookup
        const submissionMap = new Map();
        studentSubmissions.forEach((s) => {
          if (s.assignment?.assignmentId) {
            submissionMap.set(s.assignment.assignmentId, s);
          }
        });

        // Build assignment performance items - ONLY include graded assignments
        const gradedAssignmentItems = courseAssignments
          .filter((a) => {
            // Only include assignments that have been graded
            const submission = submissionMap.get(a.assignmentId);
            return submission?.grade != null && submission.grade !== undefined;
          })
          .map((a) => {
            const submission = submissionMap.get(a.assignmentId);
            // At this point, we know the assignment has been graded
            const grade = Number(submission.grade);
            return {
              assignment_id: a.assignmentId,
              title: a.title,
              grade: grade,
            };
          });

        // Calculate average grade (only from graded assignments)
        const avgGrade =
          gradedAssignmentItems.length > 0
            ? Math.round(
                gradedAssignmentItems.reduce((sum, a) => sum + a.grade, 0) /
                  gradedAssignmentItems.length
              )
            : 0;

        setData({
          avg_grade: avgGrade,
          assignments: gradedAssignmentItems, // Only graded assignments
        });
      } catch (e) {
        console.error(e);
        toast.error("Failed to load performance");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading performance data…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">
          No performance data yet. Your graded assignments will appear here once
          they are graded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview Card */}
      <section
        aria-label="Your performance overview"
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Your Course Performance
          </h3>
        </div>

        {/* Average Grade Display */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Grade</p>
              <p className="text-3xl font-bold text-indigo-700">
                {data.avg_grade}
                <span className="text-lg text-gray-500">/100</span>
              </p>
            </div>
            {data.avg_grade >= 70 ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-orange-600" />
            )}
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {data.assignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                No graded assignments yet. Your performance will appear here
                once assignments are graded.
              </p>
            </div>
          ) : (
            data.assignments.map((a) => {
              const good = a.grade >= 70;
              const excellent = a.grade >= 90;
              const average = a.grade >= 70 && a.grade < 90;
              return (
                <div
                  key={a.assignment_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-1.5 rounded-md ${
                          excellent
                            ? "bg-green-100"
                            : average
                            ? "bg-blue-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {good ? (
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              excellent ? "text-green-600" : "text-blue-600"
                            }`}
                          />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          {a.title}
                        </p>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-sm font-bold ${
                              excellent
                                ? "text-green-700"
                                : average
                                ? "text-blue-700"
                                : "text-orange-700"
                            }`}
                          >
                            {a.grade}/100
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              excellent
                                ? "bg-green-100 text-green-700"
                                : average
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {excellent
                              ? "Excellent"
                              : good
                              ? "On Track"
                              : "Needs Improvement"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={a.grade}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Grade ${a.grade} out of 100 for ${a.title}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        excellent
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : average
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : "bg-gradient-to-r from-orange-500 to-orange-600"
                      }`}
                      style={{ width: `${a.grade}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* AI Recommendations */}
      <section
        aria-label="AI recommended modules"
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Personalized Recommendations
          </h3>
        </div>
        <AIRecommendations studentId={studentId} courseId={courseId} />
      </section>
    </div>
  );
}
