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
        <h1 className="text-3xl font-bold text-ink" style={{ letterSpacing: "-0.02em" }}>
          Reset your password
        </h1>
        <p className="mt-2 text-ink-muted">
          Choose a new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="space-y-2">
          <label
            htmlFor="reset-password"
            className="text-sm font-medium text-ink"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars"
              required
              minLength={8}
              className="h-11 w-full rounded-xs border border-hairline bg-surface pl-10 pr-10 text-sm text-ink placeholder:text-ink-muted outline-none transition-colors focus:border-primary focus:shadow-soft"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="reset-confirm-password"
            className="text-sm font-medium text-ink"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              className="h-11 w-full rounded-xs border border-hairline bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted outline-none transition-colors focus:border-primary focus:shadow-soft"
            />
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-on-primary transition-all hover:bg-primary-dark hover:shadow-soft disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
