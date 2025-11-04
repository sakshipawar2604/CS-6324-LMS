import { useState } from "react";
import UploadResourceModal from "./UploadResourceModal";

export default function ModuleResources({ role, module, courseId, refresh }) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-indigo-600">
          Resources in this Module
        </h4>
        {role === "teacher" && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700"
          >
            + Upload Resource
          </button>
        )}
      </div>

      {module.resources.length === 0 ? (
        <p className="text-gray-500 italic text-sm">No resources yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-lg border border-gray-100">
          {module.resources.map((r) => (
            <li
              key={r.resourceId}
              className="py-2 px-3 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <p className="text-gray-800 text-sm font-medium">{r.title}</p>
                <p className="text-xs text-gray-500">
                  Uploaded: {new Date(r.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <a
                // href={r.url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline text-xs"
              >
                View / Download
              </a>
            </li>
          ))}
        </ul>
      )}

      {showUploadModal && (
        <UploadResourceModal
          moduleId={module.moduleId}
          courseId={courseId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
