import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import SkipToMain from "../components/SkipToMain";
import { User, X, Mail } from "lucide-react";

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({ ...parsed, role: parsed.role?.toLowerCase() });
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SkipToMain />
      <AdminSidebar />
      <main id="main-content" className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-indigo-700">
            Hello, {user?.fullName || "Admin"}
          </h2>
          <button
            onClick={() => setShowUserModal(true)}
            className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center shadow-md ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-200"
            aria-label="View user information"
          >
            <User className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
        </header>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet /> {/* Renders AdminDashboard, ManageUsers, etc. */}
        </div>
      </main>

      {/* User Info Modal */}
      {showUserModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-end pr-6 pt-20 z-50 animate-in fade-in duration-200"
          onClick={() => setShowUserModal(false)}
          aria-label="Close user information modal"
        >
          <div
            className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm text-center relative animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl">
              <User className="w-10 h-10" />
            </div>

            <h2 className="mt-3 text-xl font-semibold text-gray-900">
              {user?.fullName || "Admin"}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {user?.role || "No role assigned"}
            </p>

            <hr className="my-4 border-gray-200" />

            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <p className="text-gray-700">{user?.email || "Not provided"}</p>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <p className="text-gray-700 capitalize">
                  {user?.role || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
