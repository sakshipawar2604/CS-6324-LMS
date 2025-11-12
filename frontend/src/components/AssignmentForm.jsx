// import { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import api from "../services/http";

// export default function AssignmentForm({
//   courseId,
//   existing,
//   onClose,
//   onSuccess,
// }) {
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     dueDate: "",
//   });
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   useEffect(() => {
//     if (existing) {
//       // Format dueDate for date input (YYYY-MM-DD format)
//       let formattedDueDate = "";
//       if (existing.dueDate) {
//         // Extract date part only (remove time if present)
//         const dateStr = existing.dueDate.split("T")[0];
//         formattedDueDate = dateStr;
//       }
//       setForm({
//         title: existing.title || "",
//         description: existing.description || "",
//         dueDate: formattedDueDate,
//       });
//     }
//   }, [existing]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Create JSON payload (no file upload)
//     const payload = {
//       courseId: courseId,
//       title: form.title,
//       description: form.description || "",
//       dueDate: form.dueDate,
//     };

//     try {
//       if (existing) {
//         // For update, use PUT with JSON
//         await api.put(`/assignments/${existing.assignmentId}`, payload);
//         toast.success("Assignment updated successfully!");
//       } else {
//         // For creation, use POST with JSON
//         await api.post("/assignments", payload);
//         toast.success("Assignment created successfully!");
//       }
//       onSuccess();
//     } catch (err) {
//       console.error("Assignment save error:", err);
//       console.error("Error response:", err.response?.data);
//       const errorMessage =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         err.message ||
//         "Failed to save assignment. Please check that all fields are filled correctly.";
//       toast.error(errorMessage);
//     }
//   };

//   const confirmDelete = async () => {
//     try {
//       await api.delete(`/assignments/${existing.assignmentId}`);
//       toast.success("Assignment deleted successfully!");
//       onSuccess();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete assignment");
//     } finally {
//       setShowDeleteConfirm(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
//         <h2 className="text-lg font-semibold text-indigo-700 mb-4">
//           {existing ? "Edit Assignment" : "Create Assignment"}
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-3">
//           <div>
//             <label className="block text-sm text-gray-700 mb-1">Title</label>
//             <input
//               type="text"
//               name="title"
//               value={form.title}
//               onChange={handleChange}
//               required
//               className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-700 mb-1">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               rows="2"
//               className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-700 mb-1">Due Date</label>
//             <input
//               type="date"
//               name="dueDate"
//               value={form.dueDate}
//               onChange={handleChange}
//               className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
//             />
//           </div>

//           <div className="flex justify-between items-center pt-4">
//             {existing && (
//               <button
//                 type="button"
//                 onClick={() => setShowDeleteConfirm(true)}
//                 className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             )}

//             <div className="flex gap-3 ml-auto">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
//               >
//                 {existing ? "Update" : "Create"}
//               </button>
//             </div>
//           </div>
//         </form>

//         {/* Delete confirmation modal */}
//         {showDeleteConfirm && (
//           <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
//             <div className="bg-white rounded-lg shadow-lg p-5 w-80 text-center">
//               <h3 className="text-md font-semibold text-gray-800 mb-3">
//                 Confirm Delete
//               </h3>
//               <p className="text-sm text-gray-600 mb-5">
//                 Are you sure you want to delete{" "}
//                 <strong>{existing.title}</strong>?
//               </p>
//               <div className="flex justify-center gap-3">
//                 <button
//                   onClick={() => setShowDeleteConfirm(false)}
//                   className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmDelete}
//                   className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/http";

export default function AssignmentForm({
  courseId,
  existing,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    file: null,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || "",
        description: existing.description || "",
        dueDate: existing.dueDate || "",
        file: null,
      });
    }
  }, [existing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("dueDate", form.dueDate);
      if (form.file) formData.append("file", form.file); // from file upload

      // Some test environments mock only success/error; guard loading
      if (typeof toast.loading === "function") {
        toast.loading(existing ? "Updating..." : "Creating...", { id: "save" });
      }

      if (existing) {
        await api.put(`/assignments/${existing.assignmentId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Assignment updated successfully!", { id: "save" });
      } else {
        await api.post("/assignments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Assignment created successfully!", { id: "save" });
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save assignment", { id: "save" });
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/assignments/${existing.assignmentId}`);
      toast.success("Assignment deleted successfully!");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete assignment");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          {existing ? "Edit Assignment" : "Create Assignment"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="2"
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) setForm((prev) => ({ ...prev, file }));
            }}
            className="border-2 border-dashed rounded-lg w-full p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <input
              type="file"
              id="fileUpload"
              accept=".pdf,.doc,.docx,image/*"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              className="hidden"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer text-indigo-600 font-medium"
            >
              {form.file
                ? `Selected: ${form.file.name}`
                : "Click or drag & drop a file here"}
            </label>
          </div>

          <div className="flex justify-between items-center pt-4">
            {existing && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            )}

            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {existing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
            <div className="bg-white rounded-lg shadow-lg p-5 w-80 text-center">
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to delete{" "}
                <strong>{existing.title}</strong>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
