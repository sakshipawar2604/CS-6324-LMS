import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/http";
import UploadModuleModal from "./module/UploadModuleModal";
import ModuleResources from "./module/ModuleResources";

export default function CourseModules({ role, courseId }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch all modules for this course
  const fetchModules = async () => {
    try {
      const res = await api.get(`/modules/getModulesByCourseId/${courseId}`);
      setModules(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load course modules");
    } finally {
      setLoading(false);
    }
  };

  // Run once on mount or when courseId changes
  useEffect(() => {
    fetchModules();
  }, [courseId]);

  // Refresh after upload or edit
  const refreshModules = () => fetchModules();

  // 🔹 Delete module handler
  const handleDeleteModule = async (moduleId, moduleTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the module "${moduleTitle}"? This will also delete all resources in this module.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/modules/${moduleId}`);
      toast.success("Module deleted successfully!");
      fetchModules(); // Refresh the list
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete module");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-indigo-600">
          Course Modules
        </h2>
        {role === "teacher" && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700"
          >
            + Upload Module
          </button>
        )}
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <p className="text-gray-500 italic">Loading modules...</p>
      ) : modules.length === 0 ? (
        <p className="text-gray-500 italic">No modules uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {modules.map((m) => (
            <div
              key={m.moduleId}
              className="bg-white rounded-xl shadow border border-gray-100"
            >
              {/* Module Header */}
              <div className="flex justify-between items-center px-4 py-3">
                <div
                  className="flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2"
                  onClick={() =>
                    setExpandedModule(
                      expandedModule === m.moduleId ? null : m.moduleId
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-800 font-medium">{m.title}</h3>
                      {m.description && (
                        <p className="text-sm text-gray-500 italic mt-1">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <span className="text-indigo-600 text-sm hover:bg-indigo-100 rounded-md p-1 ml-4">
                      {expandedModule === m.moduleId ? "▲ Hide" : "▼ Show"}
                    </span>
                  </div>
                </div>

                {/* Delete Button (only for teachers) */}
                {role === "teacher" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent expanding/collapsing when clicking delete
                      handleDeleteModule(m.moduleId, m.title);
                    }}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                    title="Delete module"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Expanded Module Section */}
              {expandedModule === m.moduleId && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <ModuleResources
                    role={role}
                    moduleId={m.moduleId}
                    courseId={courseId}
                    refresh={refreshModules}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Module Modal */}
      {showUploadModal && (
        <UploadModuleModal
          courseId={courseId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={refreshModules}
        />
      )}
    </div>
  );
}
