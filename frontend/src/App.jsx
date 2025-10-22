import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CourseDetails from "./pages/CourseDetails";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* dashboard layout routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses/:courseId" element={<CourseDetails />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses/:courseId" element={<CourseDetails />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
