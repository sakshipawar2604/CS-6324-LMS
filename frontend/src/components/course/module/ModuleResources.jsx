import { useEffect, useState } from "react";
import api from "../../../services/http";
import toast from "react-hot-toast";
import UploadResourceModal from "./UploadResourceModal";
import EditResourceModal from "./EditResourceModal";

export default function ModuleResources({ role, moduleId, courseId }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editResource, setEditResource] = useState(null);

  const fetchResources = async () => {
    try {
      const res = await api.get(
        `/resources/getResourcesByModuleId/${moduleId}`
      );
      setResources(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [moduleId]);

  const handleDelete = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;

    try {
      await api.delete(`/resources/${resourceId}`);
      toast.success("Resource deleted successfully!");
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete resource");
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h4 className="text-indigo-700 font-medium">
          Resources in this Module
        </h4>

        {role?.toLowerCase() === "teacher" && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700"
          >
            + Upload Resource
          </button>
        )}
      </div>

      {/* Loading and List */}
      {loading ? (
        <p className="text-gray-500 text-sm italic">Loading resources...</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No resources yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-md border border-gray-100">
          {resources.map((r) => (
            <li
              key={r.resourceId}
              className="p-3 flex justify-between items-center"
            >
              <div>
                <p className="text-gray-800 font-medium">{r.title}</p>
                <p className="text-xs text-gray-500">
                  Uploaded on:{" "}
                  {r.uploadDate
                    ? new Date(r.uploadDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline text-sm"
                >
                  View
                </a>

                {role?.toLowerCase() === "teacher" && (
                  <>
                    <button
                      onClick={() => setEditResource(r)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(r.resourceId)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadResourceModal
          moduleId={moduleId}
          courseId={courseId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchResources}
        />
      )}

      {/* Edit Modal */}
      {editResource && (
        <EditResourceModal
          resource={editResource}
          onClose={() => setEditResource(null)}
          onSuccess={fetchResources}
        />
      )}
    </div>
  );
}
