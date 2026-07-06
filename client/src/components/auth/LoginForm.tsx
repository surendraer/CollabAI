import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">
          Welcome back
        </h1>
        <p className="mt-2 text-[14px] text-[#7a7a7a] dark:text-[#cccccc]">
          Sign in to your Research Collab workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              required
              className="h-11 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#161617] pl-10 pr-4 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
              Password
            </label>
            <Link to="/forgot-password" className="text-[12px] font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="h-11 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#161617] pl-10 pr-10 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a7a] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] hover:bg-[#0071e3] font-medium text-sm text-white transition-all active-scale disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#7a7a7a] dark:text-[#cccccc]">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline">
          Sign up free
        </Link>
      </p>
    </motion.div>
  );
}
