// src/components/AIRecommendations.jsx
import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";
import {
  Loader2,
  Sparkles,
  ExternalLink,
  Video,
  FileText,
  Globe,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  Info,
} from "lucide-react";

function recoBasePath() {
  const base = (api.defaults?.baseURL || "").toString();
  // If your axios baseURL already ends with /api, don't add /api again
  return /\/api\/?$/i.test(base) ? "/reco" : "/api/reco";
}

export default function AIRecommendations({ studentId, courseId }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const RECO_BASE = recoBasePath();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // 0) sanity: verify backend config
        try {
          const dbg = await api.get(`${RECO_BASE}/debug`);
          console.log("[AI-REC] /reco/debug:", dbg.data);
        } catch (e) {
          console.warn(
            "[AI-REC] /reco/debug failed:",
            e?.response?.status,
            e?.message
          );
        }

        // 1) Fetch assignments and submissions to build conceptScores from real data
        console.log(
          "[AI-REC] Fetching data for studentId:",
          studentId,
          "courseId:",
          courseId
        );

        const [assignmentsRes, submissionsRes] = await Promise.all([
          api.get(`/assignments`).catch((err) => {
            console.error("[AI-REC] Failed to fetch assignments:", err);
            return { data: [] };
          }),
          api.get(`/submissions`).catch((err) => {
            console.error("[AI-REC] Failed to fetch submissions:", err);
            return { data: [] };
          }),
        ]);

        const allAssignments = assignmentsRes.data || [];
        const allSubmissions = submissionsRes.data || [];

        console.log(
          "[AI-REC] Fetched assignments:",
          allAssignments.length,
          "submissions:",
          allSubmissions.length
        );

        // Filter assignments for this course
        const courseAssignments = allAssignments.filter(
          (a) => a.course?.courseId === Number(courseId)
        );
        console.log("[AI-REC] Course assignments:", courseAssignments.length);

        // Filter submissions for this student
        const studentSubmissions = allSubmissions.filter(
          (s) => s.student?.userId === Number(studentId)
        );
        console.log("[AI-REC] Student submissions:", studentSubmissions.length);

        // Create a map of assignmentId -> submission for quick lookup
        const submissionMap = new Map();
        studentSubmissions.forEach((s) => {
          if (s.assignment?.assignmentId) {
            submissionMap.set(s.assignment.assignmentId, s);
          }
        });

        // Build conceptScores from real assignment data
        // IMPORTANT: Only include GRADED assignments for AI recommendations
        // Only assignments that have been submitted AND graded will be considered
        const conceptScores = courseAssignments
          .filter((a) => {
            // Only include assignments with valid, non-empty titles
            if (!a?.title || a.title.trim().length === 0) {
              return false;
            }
            // Only include assignments that have been graded
            const submission = submissionMap.get(a.assignmentId);
            return submission?.grade != null && submission.grade !== undefined;
          })
          .map((a) => {
            const submission = submissionMap.get(a.assignmentId);
            // At this point, we know the assignment has been graded
            const score = Number(submission.grade);

            return {
              concept: String(a.title).trim(),
              score: score,
            };
          });

        console.log(
          "[AI-REC] conceptScores from graded assignments:",
          conceptScores
        );
        console.log("[AI-REC] Total graded assignments:", conceptScores.length);
        console.log(
          "[AI-REC] Total assignments in course:",
          courseAssignments.length
        );
        console.log(
          "[AI-REC] Assignments below threshold (70):",
          conceptScores.filter((c) => c.score < 70).length
        );

        // If no graded assignments found, skip AI recommendations
        if (conceptScores.length === 0) {
          console.log(
            "[AI-REC] No graded assignments found for this course - skipping recommendations"
          );
          setRecs([]);
          setLoading(false);
          return;
        }

        // 2) Main POST — exactly like your working Postman
        const payload = {
          studentId: Number(studentId),
          courseId: Number(courseId),
          threshold: 70,
          topN: 5,
          conceptScores,
        };
        console.log(
          "[AI-REC] POST",
          `${RECO_BASE}/performance-and-recos`,
          payload
        );

        let data;
        try {
          const recoRes = await api.post(
            `${RECO_BASE}/performance-and-recos`,
            payload,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          data = recoRes?.data;
          console.log("[AI-REC] resp(perf+recos):", data);
        } catch (err) {
          const status = err?.response?.status;
          const body = err?.response?.data;
          console.error(
            "[AI-REC] perf+recos ERROR:",
            status,
            body || err?.message
          );
          toast.error(
            `AI endpoint failed (${status || "network"}). Falling back.`
          );

          // Fallback: from-concepts so the UI still shows links
          // Use actual assignment concepts from the course, not hardcoded ones
          const fbBody = {
            concepts: conceptScores.map((c) => c.concept),
            topN: 5,
          };
          const fbRes = await api.post(`${RECO_BASE}/from-concepts`, fbBody, {
            headers: { "Content-Type": "application/json" },
          });
          const items = (fbRes?.data?.items || []).map((r) => ({
            resource_title: r.title || r.url,
            url: r.url,
            reason: r.rationale || "General study resource (fallback)",
            confidence: 0.75,
            type: "web",
            topic: fbBody.concepts[0],
            snippet: r.snippet,
            source: r.source,
          }));
          setRecs(items);
          return;
        }

        // 3) Map to your UI shape
        const items = (data?.recommendations || []).map((r) => ({
          resource_title: r.title || r.url,
          url: r.url,
          reason: r.rationale || `Recommended for ${r.concept}`,
          confidence: (r.confidencePct ?? 0) / 100,
          type: "web",
          topic: r.concept,
          snippet: r.snippet,
          source: r.source,
        }));
        setRecs(items);
      } catch (outer) {
        console.error("[AI-REC] outer failure:", outer);
        // Don't show error toast if it's just because there's no performance data yet
        if (outer?.response?.status === 404) {
          console.log("[AI-REC] No performance data available yet");
        } else {
          toast.error("Failed to load AI recommendations.");
        }
        setRecs([]);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && courseId) load();
  }, [studentId, courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Analyzing your performance…</p>
        </div>
      </div>
    );
  }

  if (!recs.length) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
        <p className="text-gray-600 font-medium">Great work!</p>
        <p className="text-sm text-gray-500 mt-1">
          No additional recommendations needed at this time.
        </p>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-600";
      case "document":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-purple-100 text-purple-600";
    }
  };

  return (
    <div className="space-y-3">
      {recs.map((r, idx) => (
        <article
          key={`${r.resource_title}-${idx}`}
          className="group border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-white"
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`p-2 rounded-lg ${getTypeColor(
                r.type || "web"
              )} shrink-0`}
            >
              {getTypeIcon(r.type || "web")}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                  {r.resource_title}
                </h4>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                  aria-label={`Open resource: ${r.resource_title}`}
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Topic */}
              {r.topic && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600 font-medium">
                    Topic: {r.topic}
                  </span>
                </div>
              )}

              {/* Snippet */}
              {r.snippet && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {r.snippet}
                </p>
              )}

              {/* Reason */}
              {r.reason && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 rounded-md border border-amber-100">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">{r.reason}</p>
                </div>
              )}

              {/* Footer Info */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                {typeof r.confidence === "number" && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Confidence:{" "}
                      <span className="font-semibold text-gray-700">
                        {(r.confidence * 100).toFixed(0)}%
                      </span>
                    </span>
                  </div>
                )}
                {r.source && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">
                      Source:{" "}
                      <span className="font-medium text-gray-600">
                        {r.source}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
