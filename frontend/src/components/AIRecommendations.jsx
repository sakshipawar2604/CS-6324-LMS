// src/components/AIRecommendations.jsx
import { useEffect, useState } from "react";
import api from "../services/http";
import toast from "react-hot-toast";

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
          console.warn("[AI-REC] /reco/debug failed:", e?.response?.status, e?.message);
        }

        // 1) Fetch performance to build conceptScores
        const perfRes = await api.get(`/student/performance/${Number(studentId)}/${Number(courseId)}`);
        const perf = perfRes?.data || {};
        const conceptScores = (perf.assignments || [])
          .filter(a => a?.title)
          .map(a => ({ concept: String(a.title).trim(), score: Number(a.grade ?? 0) }));
        console.log("[AI-REC] conceptScores:", conceptScores);

        // 2) Main POST — exactly like your working Postman
        const payload = {
          studentId: Number(studentId),
          courseId: Number(courseId),
          threshold: 70,
          topN: 5,
          conceptScores,
        };
        console.log("[AI-REC] POST", `${RECO_BASE}/performance-and-recos`, payload);

        let data;
        try {
          const recoRes = await api.post(`${RECO_BASE}/performance-and-recos`, payload, {
            headers: { "Content-Type": "application/json" },
          });
          data = recoRes?.data;
          console.log("[AI-REC] resp(perf+recos):", data);
        } catch (err) {
          const status = err?.response?.status;
          const body = err?.response?.data;
          console.error("[AI-REC] perf+recos ERROR:", status, body || err?.message);
          toast.error(`AI endpoint failed (${status || "network"}). Falling back.`);

          // Fallback: from-concepts so the UI still shows links
          const fbBody = {
            concepts: conceptScores.length > 0
              ? conceptScores.map(c => c.concept)
              : ["Graph Traversal", "Dynamic Programming"],
            topN: 5,
          };
          const fbRes = await api.post(`${RECO_BASE}/from-concepts`, fbBody, {
            headers: { "Content-Type": "application/json" },
          });
          const items = (fbRes?.data?.items || []).map(r => ({
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
        const items = (data?.recommendations || []).map(r => ({
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
        toast.error("Failed to load AI recommendations.");
        setRecs([]);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && courseId) load();
  }, [studentId, courseId]);

  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-gray-500 animate-pulse">🤖 Analyzing your performance…</p>
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    );
  }

  if (!recs.length) {
    return (
      <p className="text-gray-500">🎉 No extra modules needed right now.</p>
    );
  }

  const typeIcon = (t) => (t === "video" ? "▶️" : t === "document" ? "📄" : "🌐");

  return (
    <ul className="space-y-3">
      {recs.map((r, idx) => (
        <li
          key={`${r.resource_title}-${idx}`}
          role="article"
          className="bg-white rounded-xl shadow p-4 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-indigo-700">
                {typeIcon(r.type)} {r.resource_title}
              </h3>
              {r.topic && <p className="text-xs text-gray-500 mt-0.5">Topic: {r.topic}</p>}
              {r.snippet && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.snippet}</p>}
              {r.reason && <p className="text-xs text-gray-500 mt-1 italic">💡 {r.reason}</p>}
              {typeof r.confidence === "number" && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Confidence: {(r.confidence * 100).toFixed(0)}%
                </p>
              )}
              {r.source && <p className="text-[11px] text-gray-400 mt-0.5">Source: {r.source}</p>}
            </div>

            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-3 py-1"
              aria-label={`Open resource: ${r.resource_title}`}
            >
              Open
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
