import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import toast from "react-hot-toast";
import api from "../services/http";
import AuthLayout from "../layouts/AuthLayout";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

// Validation schema using Yup
const schema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Email required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .required("Password required"),
});

export default function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      // Login request — get JWT token
      const res = await api.post("/auth/login", data);
      const token = res.data.token;
      if (!token) throw new Error("Token missing from response");

      // Save token to localStorage immediately
      localStorage.setItem("token", token);

      const usersRes = await api.get("/users");
      const allUsers = usersRes.data || [];

      // Match logged-in user by email
      const loggedInUser = allUsers.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (!loggedInUser) throw new Error("User not found in system");

      // Build and store full user profile
      const userProfile = {
        userId: loggedInUser.userId,
        fullName: loggedInUser.fullName,
        email: loggedInUser.email,
        role: loggedInUser.role.roleName.toLowerCase(),
      };

      localStorage.setItem("user", JSON.stringify(userProfile));

      toast.success(`Welcome back, ${userProfile.fullName.split(" ")[0]}!`);

      // Redirect by role
      switch (userProfile.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "teacher":
          navigate("/teacher/dashboard");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
        default:
          toast.error("Invalid role detected");
      }

      reset();
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Incorrect credentials");
    }
  };

  return (
    <AuthLayout>
      <div
        id="main-content"
        className="w-full bg-white/90 backdrop-blur-xl border border-indigo-100/50 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 animate-fade-in"
      >
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-2">
          Welcome to LMS
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Sign in to continue your learning journey
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          aria-label="Login form"
          noValidate
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  errors.email ? "text-red-400" : "text-gray-400"
                } transition-colors`}
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                placeholder="example@lms.edu"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full border ${
                  errors.email
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-indigo-300"
                } rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200`}
              />
            </div>
            {errors.email && (
              <div
                id="email-error"
                className="flex items-center gap-2 mt-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md border border-red-200 animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <p>{errors.email.message}</p>
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  errors.password ? "text-red-400" : "text-gray-400"
                } transition-colors`}
                aria-hidden="true"
              />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`w-full border ${
                  errors.password
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-indigo-300"
                } rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200`}
              />
            </div>
            {errors.password && (
              <div
                id="password-error"
                className="flex items-center gap-2 mt-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md border border-red-200 animate-fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <p>{errors.password.message}</p>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors duration-200 hover:underline inline-flex items-center gap-1"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
