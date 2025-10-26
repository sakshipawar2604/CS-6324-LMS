import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import SkipToMain from "../components/SkipToMain";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SkipToMain />
      <AdminSidebar />
      <main id="main-content" className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* Renders AdminDashboard, ManageUsers, etc. */}
      </main>
    </div>
  );
}
