import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { workspaceApi } from "@/api/workspace.api";
import toast from "react-hot-toast";

export default function JoinWorkspacePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (token) {
      handleAcceptInvite(token);
    } else {
      setStatus("error");
      setErrorMsg("No invitation token provided.");
    }
  }, [token]);

  const handleAcceptInvite = async (invToken: string) => {
    try {
      await workspaceApi.acceptInvite(invToken);
      setStatus("success");
      toast.success("Successfully joined the workspace! 🎉");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error.response?.data?.message || "Invalid or expired invitation token.");
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl space-y-6">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">Verifying Workspace Invite</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Processing invitation details, please wait...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <ShieldCheck className="mx-auto h-12 w-12 text-emerald-500 bg-emerald-500/10 p-2 rounded-full" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">Invitation Confirmed!</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Welcome aboard! Redirecting you to your team workspace in a moment...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <ShieldAlert className="mx-auto h-12 w-12 text-red-500 bg-red-500/10 p-2 rounded-full" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">Invitation Failed</h2>
            <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] py-2 text-sm font-semibold text-white hover:bg-[var(--primary)]/90"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
