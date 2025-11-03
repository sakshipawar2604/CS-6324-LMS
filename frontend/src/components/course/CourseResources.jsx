import { useState } from "react";
import UploadResourceModal from "../UploadResourceModal";

export default function CourseResources({
  role,
  courseId,
  resources,
  refresh,
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-indigo-600">Resources</h2>
        {role === "teacher" && (
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
        <ul className="divide-y divide-gray-200 bg-white rounded-xl shadow">
          {resources.map((r) => (
            <li
              key={r.resource_id || r.resourceId}
              className="py-3 px-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <p className="text-gray-800 font-medium">{r.title}</p>
                <p className="text-xs text-gray-500">
                  Uploaded on:{" "}
                  {r.uploaded_at || r.uploadedAt
                    ? new Date(
                        r.uploaded_at || r.uploadedAt
                      ).toLocaleDateString()
                    : "—"}
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
          courseId={courseId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
