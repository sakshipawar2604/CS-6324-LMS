import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import toast from "react-hot-toast";
import api from "../services/http";
import SkipToMain from "../components/SkipToMain";

// Validation schema
const schema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Step 1: Find user by email
      const usersRes = await api.get("/users");
      const allUsers = usersRes.data || [];
      const user = allUsers.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (!user) {
        toast.error("No account found with this email address");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Update user password using PUT API
      // Include all required user fields to ensure proper update
      const updatePayload = {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        passwordHash: data.newPassword, // Backend stores as passwordHash (plain text for now)
        role: user.role || {
          roleId: user.role?.roleId,
          roleName: user.role?.roleName,
        }, // Ensure role object is included
        createdAt: user.createdAt,
      };

      await api.put(`/users/${user.userId}`, updatePayload);

      toast.success(
        "Password updated successfully! Please login with your new password."
      );
      reset();
      navigate("/login");
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <SkipToMain />
      <div
        id="main-content"
        className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-3xl shadow-2xl p-8 animate-fade-in"
      >
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-2">
          Reset Password
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Enter your email and new password to reset your account password
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          aria-label="Forgot password form"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@lms.edu"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full border ${
                errors.email ? "border-red-400" : "border-gray-300"
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition`}
            />
            {errors.email && (
              <div className="flex items-center gap-2 mt-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded-md border border-red-200">
                <span>⚠️</span>
                <p>{errors.email.message}</p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              {...register("newPassword")}
              aria-invalid={errors.newPassword ? "true" : "false"}
              aria-describedby={
                errors.newPassword ? "newPassword-error" : undefined
              }
              className={`w-full border ${
                errors.newPassword ? "border-red-400" : "border-gray-300"
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition`}
            />
            {errors.newPassword && (
              <div className="flex items-center gap-2 mt-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded-md border border-red-200">
                <span>⚠️</span>
                <p>{errors.newPassword.message}</p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              className={`w-full border ${
                errors.confirmPassword ? "border-red-400" : "border-gray-300"
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition`}
            />
            {errors.confirmPassword && (
              <div className="flex items-center gap-2 mt-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded-md border border-red-200">
                <span>⚠️</span>
                <p>{errors.confirmPassword.message}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 shadow-md"
          >
            {isSubmitting ? "Updating Password..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
