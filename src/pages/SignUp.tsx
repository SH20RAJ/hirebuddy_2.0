import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const SignUp = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  const { signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateCard(true);
  }, []);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign up with Google. Please try again.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGithub();
    } catch (err) {
      setError("Failed to sign up with GitHub. Please try again.");
      console.error(err);
      setIsLoading(false);
    }
  };

  // Mobile-specific sign-up UI
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#fcdfe6]">
        {/* Mobile Header with Logo */}
        <div className="pt-8 pb-4 px-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#f78f97] to-[#dc425d] rounded-2xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hirebuddy</h1>
          </div>
        </div>

        {/* Sign Up Card */}
        <motion.div
          className="px-4 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600 text-sm">
                Join Hirebuddy and accelerate your career
              </p>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="mb-4 bg-red-50/80 backdrop-blur-sm border-red-200/50"
              >
                <AlertDescription className="text-red-700 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {/* Google Sign Up */}
              <Button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-white text-gray-700 border border-gray-200 transition-all duration-300 hover:shadow-md rounded-xl group"
                variant="outline"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="font-medium">Sign up with Google</span>
                </div>
              </Button>

              {/* GitHub Sign Up */}
              <Button
                onClick={handleGithubSignUp}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-white text-gray-700 border border-gray-200 transition-all duration-300 hover:shadow-md rounded-xl group"
                variant="outline"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="font-medium">Sign up with GitHub</span>
                </div>
              </Button>
            </div>

            {/* Features Preview - Compact for mobile */}
            <div className="mt-6 p-3 bg-gradient-to-r from-[#fcdfe6] to-[#fcdfe6]/50 rounded-xl border border-[#feb7b7]/30">
              <h3 className="font-semibold text-gray-900 mb-1.5 text-center text-xs">
                What you'll get:
              </h3>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-[#f78f97] rounded-full"></div>
                  <span className="text-gray-700">Smart job alerts</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-[#f78f97] rounded-full"></div>
                  <span className="text-gray-700">Resume builder</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-[#f78f97] rounded-full"></div>
                  <span className="text-gray-700">Interview prep</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-[#f78f97] rounded-full"></div>
                  <span className="text-gray-700">Career insights</span>
                </div>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/?signin=true"
                  className="text-[#dc425d] font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits Section - Mobile specific */}
          <div className="mt-6 bg-white/80 rounded-2xl p-3 shadow-lg border border-white/20">
            <h3 className="font-semibold text-gray-900 mb-2 text-xs">
              Why join Hirebuddy?
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#fcdfe6] flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#f78f97] rounded-full"></div>
                </div>
                <p className="text-[10px] text-gray-700">
                  AI-powered job matching that finds opportunities tailored to
                  your skills
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#fcdfe6] flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#f78f97] rounded-full"></div>
                </div>
                <p className="text-[10px] text-gray-700">
                  Automated application tracking to never miss a follow-up
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#fcdfe6] flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#f78f97] rounded-full"></div>
                </div>
                <p className="text-[10px] text-gray-700">
                  Interview preparation with AI coaching and feedback
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Desktop UI (original)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-[#fcdfe6] p-4 sm:p-6 md:p-8">
      <motion.div
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f78f97] animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-[#fcdfe6] to-[#feb7b7] animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#feb7b7]/30 via-white to-white animate-pulse delay-700"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-20 left-20 w-72 h-72 bg-[#feb7b7]/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#feb7b7]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#fcdfe6]/50 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-16 text-black">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <h1 className="text-2xl font-black text-black">Hirebuddy</h1>
              </div>

              <h2 className="text-4xl font-black leading-tight mb-3 text-black">
                Land Your Dream Job
                <br />
                <span className="text-[#dc425d] font-black text-5xl">
                  Effortlessly
                </span>
              </h2>

              <p className="text-xl text-black mb-8 leading-relaxed font-medium">
                Hirebuddy finds, matches, and applies to jobs - so you don't
                have to
              </p>

              <div className="space-y-2 text-black">
                <div className="bg-white/60 backdrop-blur-xl rounded-xl p-1.5 shadow-sm border border-white/40 hover:shadow-md transition-all duration-300 inline-block">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3 text-gray-700 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span className="text-xs font-semibold">
                      Find Jobs That Fit You
                    </span>
                  </div>
                </div>
                <br />
                <div className="bg-white/60 backdrop-blur-xl rounded-xl p-1.5 shadow-sm border border-white/40 hover:shadow-md transition-all duration-300 inline-block">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3 text-gray-700 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span className="text-xs font-semibold">
                      One Click Application
                    </span>
                  </div>
                </div>
                <br />
                <div className="bg-white/60 backdrop-blur-xl rounded-xl p-1.5 shadow-sm border border-white/40 hover:shadow-md transition-all duration-300 inline-block">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3 text-gray-700 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      ></path>
                    </svg>
                    <span className="text-xs font-semibold">
                      More Interviews, Less Stress
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md relative">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#f78f97] to-[#dc425d] rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Hirebuddy</h1>
              </div>
            </div>

            {/* Sign Up Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 animate-slideIn hover:shadow-[#feb7b7]/30 transition-all duration-500">
              <div className="text-center mb-8 animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 hover:text-[#dc425d] transition-colors duration-300">
                  Create Your Account
                </h2>
                <p className="text-gray-600 animate-fadeIn animation-delay-100">
                  Join Hirebuddy and accelerate your career
                </p>
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="mb-6 bg-red-50/80 backdrop-blur-sm border-red-200/50"
                >
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {/* Google Sign Up */}
                <Button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full h-14 bg-white/80 hover:bg-white text-gray-700 border border-gray-200 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.03] rounded-2xl group animate-fadeIn"
                  variant="outline"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className="w-5 h-5 group-hover:scale-125 transition-transform duration-300 group-hover:rotate-3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="font-medium group-hover:text-blue-600 transition-colors duration-300">
                      Sign up with Google
                    </span>
                  </div>
                </Button>

                {/* GitHub Sign Up */}
                <Button
                  onClick={handleGithubSignUp}
                  disabled={isLoading}
                  className="w-full h-14 bg-white/80 hover:bg-white text-gray-700 border border-gray-200 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.03] rounded-2xl group animate-fadeIn animation-delay-200"
                  variant="outline"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className="w-5 h-5 group-hover:scale-125 transition-transform duration-300 group-hover:rotate-3"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="font-medium group-hover:text-blue-600 transition-colors duration-300">
                      Sign up with GitHub
                    </span>
                  </div>
                </Button>
              </div>

              {/* Features Preview */}
              <div className="mt-8 p-3 bg-gradient-to-r from-[#fcdfe6] to-[#fcdfe6]/50 rounded-2xl border border-[#feb7b7]/30 hover:shadow-md hover:border-[#feb7b7]/50 transition-all duration-300 animate-fadeIn animation-delay-300">
                <h3 className="font-semibold text-gray-900 mb-2 text-center text-xs">
                  What you'll get:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1 h-1 bg-[#f78f97] rounded-full"></div>
                    <span className="text-gray-700 hover:text-[#dc425d] transition-colors duration-300">
                      Smart job alerts
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1 h-1 bg-[#f78f97] rounded-full"></div>
                    <span className="text-gray-700 hover:text-[#dc425d] transition-colors duration-300">
                      Resume builder
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1 h-1 bg-[#f78f97] rounded-full"></div>
                    <span className="text-gray-700 hover:text-[#dc425d] transition-colors duration-300">
                      Interview prep
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:translate-x-1 transition-transform duration-300">
                    <div className="w-1 h-1 bg-[#f78f97] rounded-full"></div>
                    <span className="text-gray-700 hover:text-[#dc425d] transition-colors duration-300">
                      Career insights
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/?signin=true"
                    className="text-[#dc425d] font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
