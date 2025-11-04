import { useState } from "react";
import UploadModuleModal from "./module/UploadModuleModal";
import ModuleResources from "./module/ModuleResources";

export default function CourseModules({ role, courseId }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);

  // 🔹 Mock modules data
  const [modules, setModules] = useState([
    {
      moduleId: 1,
      title: "Module 1: Introduction to Java",
      uploadedAt: "2025-11-01",
      resources: [
        {
          resourceId: 1,
          title: "Java Basics PDF",
          url: "#",
          uploadedAt: "2025-11-02",
        },
        {
          resourceId: 2,
          title: "OOP Concepts PPT",
          url: "#",
          uploadedAt: "2025-11-03",
        },
      ],
    },
    {
      moduleId: 2,
      title: "Module 2: Spring Boot Essentials",
      uploadedAt: "2025-11-04",
      resources: [
        {
          resourceId: 3,
          title: "Spring Boot Guide PDF",
          url: "#",
          uploadedAt: "2025-11-05",
        },
      ],
    },
  ]);

  const refreshModules = () => {
    // Will later call backend to reload
    console.log("Modules refreshed");
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

      {/* Module list */}
      {modules.length === 0 ? (
        <p className="text-gray-500 italic">No modules uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {modules.map((m) => (
            <div
              key={m.moduleId}
              className="bg-white rounded-xl shadow border border-gray-100"
            >
              <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setExpandedModule(
                    expandedModule === m.moduleId ? null : m.moduleId
                  )
                }
              >
                <div>
                  <h3 className="text-gray-800 font-medium">{m.title}</h3>
                  <p className="text-xs text-gray-500">
                    Uploaded on {new Date(m.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-indigo-600 text-sm hover:bg-indigo-100 rounded-md p-1">
                  {expandedModule === m.moduleId ? "▲ Hide" : "▼ Show"}
                </span>
              </div>

              {expandedModule === m.moduleId && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <ModuleResources
                    role={role}
                    module={m}
                    courseId={courseId}
                    refresh={refreshModules}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload module modal */}
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
