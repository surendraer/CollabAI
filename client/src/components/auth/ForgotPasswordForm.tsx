import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useForgotPassword } from "@/hooks/useAuth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword(
      { email },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0066cc]/10">
          <Mail className="h-7 w-7 text-[#0066cc]" />
        </div>
        <h1 className="text-[24px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">
          Check your email
        </h1>
        <p className="mt-2 text-[14px] text-[#7a7a7a] dark:text-[#cccccc]">
          If an account exists for <strong>{email}</strong>, we've sent a
          password reset link.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#0066cc] dark:text-[#2997ff] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">
          Forgot password?
        </h1>
        <p className="mt-2 text-[14px] text-[#7a7a7a] dark:text-[#cccccc]">
          Enter your academic email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="forgot-email" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              required
              className="h-11 w-full rounded-lg border border-[#e0e0e0] dark:border-[#333333] bg-white dark:bg-[#161617] pl-10 pr-4 text-sm text-[#1d1d1f] dark:text-white placeholder:text-[#7a7a7a] focus:border-[#0066cc] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] hover:bg-[#0071e3] font-medium text-sm text-white transition-all active-scale disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#7a7a7a] dark:text-[#cccccc]">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}
