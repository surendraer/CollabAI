import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { useResetPassword } from "@/hooks/useAuth";

export function ResetPasswordForm() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    resetPassword({ token, data: { password, confirmPassword } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight-display">
          Reset password
        </h1>
        <p className="mt-2 text-[14px] text-[#7a7a7a] dark:text-[#cccccc]">
          Choose a new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="reset-password" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="reset-password"
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
          <label htmlFor="reset-confirm-password" className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7a7a]" />
            <input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
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
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </motion.div>
  );
}
