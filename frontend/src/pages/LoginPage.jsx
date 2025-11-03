import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import toast from "react-hot-toast";
import api from "../services/http";
import { useEffect } from "react";
import SkipToMain from "../components/SkipToMain";

// Validation schema using Yup
const schema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters long")
    .required("Password is required"),
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

  // const onSubmit = async (data) => {
  //   try {
  //     const res = await api.post("/auth/login", data);

  //     localStorage.setItem("user", JSON.stringify(res.data));
  //     toast.success("Login successful");

  //     const role = res.data.role;
  //     if (role === "admin") navigate("/admin/dashboard");
  //     else if (role === "teacher") navigate("/teacher/dashboard");
  //     else navigate("/student/dashboard");

  //     reset();
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Incorrect credentials");
  //   }
  // };

  const onSubmit = async (data) => {
    try {
      const res = await api.post("/auth/login", data);

      const token = res.data.token;
      if (!token) throw new Error("Token missing from response");

      // Temporary static role until backend returns one
      const role = import.meta.env.VITE_STATIC_ROLE || "student";

      // Construct user profile object (without token)
      const userProfile = {
        role,
        email: data.email,
        name: data.email.split("@")[0],
      };

      localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(userProfile));

      toast.success("Login successful");

      // Redirect based on role
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "teacher") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");

      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect credentials");
    }
  };

  // optional: add fade-in effect
  useEffect(() => {
    document.body.classList.add(
      "bg-gradient-to-br",
      "from-blue-100",
      "to-indigo-200"
    );
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <SkipToMain />
      <div
        id="main-content"
        className="w-full max-w-md bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-3xl shadow-2xl p-8 animate-fade-in"
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
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
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
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full border ${
                errors.password ? "border-red-400" : "border-gray-300"
              } rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition`}
            />
            {errors.password && (
              <div className="flex items-center gap-2 mt-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded-md border border-red-200">
                <span>⚠️</span>
                <p>{errors.password.message}</p>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 shadow-md"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
