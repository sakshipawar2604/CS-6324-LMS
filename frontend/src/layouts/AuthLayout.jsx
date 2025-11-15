import { GraduationCap, Check } from "lucide-react";
import SkipToMain from "../components/SkipToMain";

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen">
      <SkipToMain />

      {/* Left Half - Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex-col justify-center items-center px-8 text-white relative overflow-hidden">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 animate-gradient-slow"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-6 max-w-md">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
              <GraduationCap
                className="w-16 h-16 text-white"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* App Name/Logo */}
          <h1
            className="text-5xl font-bold tracking-tight mb-2"
            aria-label="Learning Management System"
          >
            LMS Platform
          </h1>

          {/* Tagline */}
          <p className="text-xl text-white/90 font-medium">
            Learn. Teach. Grow.
          </p>

          {/* Description */}
          <p className="text-base text-indigo-200 leading-relaxed">
            Modernize your classroom experience with powerful tools for course
            management, collaboration, and student success.
          </p>

          {/* Features/Highlights */}
          <div className="pt-6 space-y-4 text-left">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" aria-hidden="true" />
              </div>
              <span className="text-indigo-100">
                AI-driven learning insights
              </span>
            </div>
            <div
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" aria-hidden="true" />
              </div>
              <span className="text-indigo-100">
                Seamless communication between teachers & students
              </span>
            </div>
            <div
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" aria-hidden="true" />
              </div>
              <span className="text-indigo-100">
                Effortless tracking of assignments and grades
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
