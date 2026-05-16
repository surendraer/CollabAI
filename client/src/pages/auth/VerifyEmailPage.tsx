import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useVerifyEmail } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const { isLoading, isSuccess, isError, error } = useVerifyEmail(token || "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-xl"
      >
        {isLoading && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--primary)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              Verifying your email...
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Please wait a moment.
            </p>
          </>
        )}

        {isSuccess && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              Email verified! 🎉
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Your email has been verified. You can now log in.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
            >
              Go to Login
            </Link>
          </>
        )}

        {isError && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              Verification failed
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              {(error as any)?.response?.data?.message ||
                "Invalid or expired verification link."}
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] px-6 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
            >
              Back to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
