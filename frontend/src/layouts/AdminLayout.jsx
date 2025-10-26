import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* Renders AdminDashboard, ManageUsers, etc. */}
      </main>
    </div>
  );
}
