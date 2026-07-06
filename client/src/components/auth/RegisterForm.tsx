import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { useRegister } from "@/hooks/useAuth";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ name, email, password, confirmPassword });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">
          Create account
        </h1>
        <p className="mt-2 text-[14px] text-[#7a7a7a] dark:text-[#cccccc]">
          Join researchers co-authoring papers on Research Collab
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="register-name" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. John Doe"
              required
              minLength={2}
              className="h-11 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#161617] pl-10 pr-4 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="register-email" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            Academic Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="register-email"
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
          <label htmlFor="register-password" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="h-11 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#161617] pl-10 pr-10 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a7a7a] hover:text-[#1d1d1f]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="register-confirm-password" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="h-11 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#161617] pl-10 pr-4 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] hover:bg-[#0071e3] font-medium text-sm text-white transition-all active-scale disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-[#7a7a7a] dark:text-[#cccccc]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline">
          Sign In
        </Link>
      </p>
    </motion.div>
  );
}
